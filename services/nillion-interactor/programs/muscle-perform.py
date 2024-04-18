from nada_dsl import *

def nada_main():

    party1 = Party(name="Party1")


    snp1 = SecretInteger(Input(name="snp1", party=party1))
    genotype1 = SecretInteger(Input(name="genotype1", party=party1))

    target_snp = Integer(11)
    target_genotype = Integer(9)

    eq1 = (snp1 >= target_snp).if_else((target_snp >= snp1).if_else(Integer(1), Integer(0)), Integer(0))
    eq2 = (genotype1 >= target_genotype).if_else((target_genotype >= genotype1).if_else(Integer(1), Integer(0)), Integer(0))


    total = eq1 + eq2

    is_successful = (total >= Integer(2)).if_else((Integer(2) >= total).if_else(Integer(1), Integer(0)), Integer(0))

    result = is_successful.reveal()

    return [Output(result, "Result", party1)]