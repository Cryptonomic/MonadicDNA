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
    // Define the filename and number of lines
    @State private var filename = "/Users/aisha/Desktop/cryptonomic/MonadicDNA/zama-poc/genomeData.txt" // TODO: upload via input
    @State private var numLines = 25

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

            Button("Process genome data") {
                processGenomeData(filename: filename, numLines: 10)

            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)

            Button("Retrieve Server Key") {
                guard let serverKey = retrieveServerKey() else {
                    clientKeyText = "No server key found in keychain"
                    return
                }
                let serverKeyLength = strlen(serverKey)
                print("Length of server key: \(serverKeyLength)")
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
