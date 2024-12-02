//
//  ContentView.swift
//  monadic_ios
//
//  Created by Aisha Opaluwa on 26/11/2024.
//

import SwiftUI

struct ContentView: View {
    @State private var statusText: String = ""
    
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
                
                if let clientKey = zama_get_client_key() {
                    let clientKeyString = String(cString: clientKey)
                    let length = strlen(clientKeyString)
                    statusText = statusText + "\nLength of the client key: \(length)"
                    print("Length of the client key: \(length)")
                }
            }
        }
    }
}



#Preview {
    ContentView()
}
