//
//  ContentView.swift
//  monadic_ios
//
//  Created by Aisha Opaluwa on 26/11/2024.
//

import SwiftUI

struct ContentView: View {
    @State private var statusText: String = ""
    @State private var clientKeyText: String = ""
    
    var body: some View {
        VStack {
            Text(statusText)
                .padding()
            
            Button("Run Zama Code") {
                if let result = zama_run() {
                    let resultString = String(cString: result)
                    statusText = resultString
                    print("Rust function output: \(resultString)")
                }
                storeClientKey()
            }
            
            
            Button("Retrieve Client Key") {
                guard let clientKey = retrieveClientKey() else {
                    clientKeyText = "No client key found in keychain"
                    return
                }
                let clientKeyLength = strlen(clientKey)
                print("Length of client key: \(clientKeyLength)")

                //                clientKeyText = clientKey
                
                clientKeyText = "Length of client key: \(clientKeyLength)"
                
            }
        }
    }
}



#Preview {
    ContentView()
}
