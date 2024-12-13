//
//  zama.swift
//  monadic_ios
//
//  Created by Aisha Opaluwa on 03/12/2024.
//

import SwiftUI
import KeychainSwift

let keychain = KeychainSwift()

func storeClientKey() {
    guard let clientKey = zama_get_client_key() else {
        print("Failed to retrieve client key.")
        return
    }
    let clientKeyString = String(cString: clientKey)
    
    keychain.set(clientKeyString, forKey: "zamaClientKey")
    print("Successfully stored client key.")
}

func retrieveClientKey() -> String? {
    return keychain.get("zamaClientKey")
}
