use std::time::Instant;
use log::info;
use env_logger::{Builder, Env};
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;
use rayon::prelude::*;


mod genome_file_processing;
mod zama_compute;


fn main() {
    Builder::from_env(Env::default().default_filter_or("info"))
        .format(|buf, record| {
            use std::io::Write;
            writeln!(buf, "{} [{}] - {}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S"), record.level(), record.args())
        })
        .init();

    info!("Hello, Zama!");

    let filename = "/home/amardeep/MonadicDNA/zama-poc/GFGFilteredUnphasedGenotypes23andMe.txt";
    let num_lines = 1000000;

    let start = Instant::now();
    zama_compute::run_iteration(filename, num_lines).expect("Well, that didn't work!");
    let duration = start.elapsed();
    info!("run_iteration took: {:?}", duration);

    info!("Bye, Zama!");
}


fn run_iteration(filename: &str, num_lines: usize) -> result::Result<(), Error> {
    info!("Setting up Zama env");
    let config = ConfigBuilder::default().build();
    let (client_key, server_key) = generate_keys(config);
    set_server_key(server_key);

    info!("Number of lines to process: {:?}", num_lines);

    let processed_data = process_file(filename, num_lines)?;
    info!("Lines of processed data: {:?}", processed_data.len());

    let encrypted_genotypes = encrypt_genotypes_for_zama(&processed_data, client_key.clone())?;
    info!("Lines of encrypted data: {:?}", encrypted_genotypes.len());

    let lookup_result1 = check_genotype(&encrypted_genotypes, "rs75333668", "CC", client_key.clone())?;
    info!("Lookup result: {:?}", lookup_result1);

    let lookup_result2 = check_genotype(&encrypted_genotypes, "rs75333668", "AA", client_key.clone())?;
    info!("Lookup result: {:?}", lookup_result2);

    let genotype_frequencies = get_genotype_frequencies(&encrypted_genotypes, client_key.clone());
    info!("Genotype frequencies: {:?}", genotype_frequencies);

    Ok(())
}

fn get_genotype_frequencies(encrypted_genotypes: &HashMap<u64, CompressedFheUint8>,
    client_key: ClientKey
) -> HashMap<u64, u64> {
    encrypted_genotypes.par_iter()
        .map(|(_encoded_rsid, encrypted_genotype)| {
            let decompressed_encrypted_genotype = encrypted_genotype.decompress();
            let decrypted_genotype = decompressed_encrypted_genotype.decrypt(&client_key);
            (decrypted_genotype, 1u64)
        })
        .collect::<HashMap<u64, u64>>()
        .into_iter()
        .fold(HashMap::new(), |mut acc, (genotype, count)| {
            *acc.entry(genotype).or_insert(0) += count;
            acc
        })
}

fn check_genotype(encrypted_genotypes: &HashMap<u64, CompressedFheUint8>,
                  rsid: &str,
                  genotype: &str,
                  client_key: ClientKey
) -> result::Result<bool, Error> {
    let encoded_rsid = encode_rsid(rsid);
    let encoded_genotype = encode_genotype(genotype);

    let encrypted_genotype = encrypted_genotypes.get(&encoded_rsid).unwrap();
    let decompressed_encrypted_genotype = encrypted_genotype.decompress();

    let encrypted_target = FheUint8::try_encrypt(encoded_genotype, &client_key).unwrap();

    Ok(decompressed_encrypted_genotype.eq(encrypted_target).decrypt(&client_key))
}

fn encrypt_genotypes_for_zama(processed_data: &HashMap<u64, u8>, client_key: ClientKey) -> result::Result<HashMap<u64, CompressedFheUint8>, Error> {
    let enc_data: HashMap<u64, CompressedFheUint8> = processed_data
        .par_iter()
        .map(|(&encoded_rsid, &encoded_genotype)| {
            let genotype_encrypted = CompressedFheUint8::try_encrypt(encoded_genotype, &client_key).unwrap();
            (encoded_rsid, genotype_encrypted)
        })
        .collect();

    Ok(enc_data)
}

fn process_file(filename: &str, num_lines: usize) -> io::Result<HashMap<u64, u8>> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);
    let lines: Vec<String> = reader.lines().take(num_lines).filter_map(Result::ok).collect();

    let results: HashMap<u64, u8> = lines
        .par_iter()
        .filter(|line| !line.starts_with('#'))
        .filter_map(|line| {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() >= 4 {
                let rsid = parts[0].to_string();
                let genotype = parts[3];

                let encoded_rsid = encode_rsid(&rsid);
                let encoded_genotype = encode_genotype(genotype);

                Some((encoded_rsid, encoded_genotype))
            } else {
                None
            }
        })
        .collect();

    Ok(results)
}

fn encode_rsid(rsid: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    rsid.trim_start_matches("rs").hash(&mut hasher);
    hasher.finish()
}

fn encode_genotype(genotype: &str) -> u8 {
    match genotype {
        "AA" => 1,
        "AC" | "CA" => 2,
        "AG" | "GA" => 3,
        "AT" | "TA" => 4,
        "CC" => 5,
        "CG" | "GC" => 6,
        "CT" | "TC" => 7,
        "GG" => 8,
        "GT" | "TG" => 9,
        "TT" => 10,
        "NN" => 11,
        "" | "???" => 12,
        _ => 0,
    }
}

