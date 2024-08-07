from nada_dsl import *

def nada_main():
    party1 = Party(name="Party1")
    a = SecretInteger(Input(name="foo", party=party1))

    result = a + a

    return [Output(result, "my_output", party1)]
