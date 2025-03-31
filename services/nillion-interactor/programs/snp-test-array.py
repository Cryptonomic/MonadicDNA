from nada_dsl import *
import nada_numpy as na

# Checks based on SNP rs1815739 whether someone is a sprinter or an endurance athelete
# Genotype TT indicates endurance athlete
# We arbitrarily assume sprinter otherwise
# This program returns 0 if sprinter, 1 if endurance athlete
# This is a counterpart to muscle-perform.py which operates on tabular data rather than atomic secrets.
from nada_dsl import *
import nada_numpy as na



def nada_main():
    target_snp_1 = Integer(548049170)
    target_genotype_1 = Integer(9)

    party1 = Party(name="Party1")

    gene_data = na.array((500, 4), party1, "gene_data", SecretInteger)
    
    # Create the boolean mask
    boolean_mask = gene_data[:, 0] == target_snp_1

    # Initialize sum_genotypes as a SecretInteger
    sum_genotypes = SecretInteger(Input(name="sum_genotypes", party=party1))

    # Iterate through the rows and sum the matching genotypes
    for i in range(500):
        row_match = boolean_mask[i]
        row_genotype = gene_data[i, 3]
        sum_genotypes = row_match.if_else(sum_genotypes + row_genotype, sum_genotypes)

    # Check if the sum of genotypes matches the target
    is_successful = sum_genotypes == target_genotype_1

    return [Output(is_successful, "Result", party1)]