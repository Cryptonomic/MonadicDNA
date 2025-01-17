from nada_dsl import *


# Checks based on SNP rs1815739 whether someone is a sprinter or an endurance athelete
# Genotype TT indicates endurance athlete
# We arbitrarily assume sprinter otherwise
# This program returns 0 if sprinter, 1 if endurance athelete
def nada_main():

    party1 = Party(name="Party1")


    snp1 = SecretInteger(Input(name="snp1", party=party1))
    genotype1 = SecretInteger(Input(name="genotype1", party=party1))

    target_snp_1 = Integer(11)
    target_genotype_1 = Integer(9)

    eq1 = (snp1 >= target_snp_1).if_else((target_snp_1 >= snp1).if_else(Integer(1), Integer(0)), Integer(0))
    eq2 = (genotype1 >= target_genotype_1).if_else((target_genotype_1 >= genotype1).if_else(Integer(1), Integer(0)), Integer(0))


    total = eq1 + eq2

    is_successful = (total >= Integer(2)).if_else((Integer(2) >= total).if_else(Integer(1), Integer(0)), Integer(0))

    result = is_successful

    return [Output(result, "Result", party1)]
