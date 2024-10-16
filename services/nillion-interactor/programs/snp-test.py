from nada_dsl import *

def nada_main():
    party1 = Party(name="Party1")

    # Input SNP and genotype as secret integers
    input_snp = SecretInteger(Input(name="input_snp", party=party1))
    input_genotype = SecretInteger(Input(name="input_genotype", party=party1))

    # Define target SNP and genotype
    # For this example, let's check for rs548049170 (coded as 11) with TT genotype (coded as 9)
    target_snp = Integer(13)  #rs548049170
    target_genotype = Integer(9)  # TT genotype

    # Check if input matches target
    snp_match = (input_snp >= target_snp).if_else((target_snp >= input_snp).if_else(Integer(1), Integer(0)), Integer(0))
    genotype_match = (input_genotype >= target_genotype).if_else((target_genotype >= input_genotype).if_else(Integer(1), Integer(0)), Integer(0))

    # Combine conditions
    is_match = snp_match * genotype_match

    return [Output(is_match, "match_result", party1)]