from nada_dsl import *


def nada_main():
    party1 = Party(name="Party1")
    snp = SecretInteger(Input(name="snp", party=party1))
    genotype = SecretInteger(Input(name="genotype", party=party1))

    target_snp = Integer(6)
    target_genotype = Integer(9)

    eq1 = (snp >= target_snp).if_else((target_snp >= snp).if_else(Integer(1), Integer(0)), Integer(0))
    eq2 = (genotype >= target_genotype).if_else((target_genotype >= genotype).if_else(Integer(1), Integer(0)), Integer(0))

    isSuccess = (eq1 >= Integer(1)).if_else((eq2 >= Integer(1)).if_else(Integer(1), Integer(0)), Integer(0))
    result = isSuccess.reveal()

    return [Output(result, "Result", party1)]
