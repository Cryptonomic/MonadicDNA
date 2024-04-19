from nada_dsl import *

# Checks based on SNP rs6025 whether someone has risk for thrombosis
# Genotype GG indicates normal risk of thrombosis
# We arbitrarily assume elevated risk otherwise
# This program returns 0 if normal risk, 1 if elevated risk
def nada_main():
    party1 = Party(name="Party1")
    snp = SecretInteger(Input(name="snp", party=party1))
    genotype = SecretInteger(Input(name="genotype", party=party1))

    target_snp = Integer(12)
    target_genotype = Integer(7)

    eq1 = (snp >= target_snp).if_else((target_snp >= snp).if_else(Integer(1), Integer(0)), Integer(0))
    eq2 = (genotype >= target_genotype).if_else((target_genotype >= genotype).if_else(Integer(1), Integer(0)), Integer(0))
    total = eq1 + eq2

    isSuccess = (total >= Integer(2)).if_else((Integer(2) >= total).if_else(Integer(1), Integer(0)), Integer(0))
    result = isSuccess.reveal()

    return [Output(result, "Result", party1)]
