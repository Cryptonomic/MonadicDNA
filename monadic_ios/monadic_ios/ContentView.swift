//
//  ContentView.swift
//  monadic_ios
//
//  Created by Aisha Opaluwa on 26/11/2024.
//

import SwiftUI

struct ContentView: View {
    @State private var num1: String = ""
    @State private var num2: String = ""
    
    @State private var resultText = "Result will appear here"

    var body: some View {
        VStack {
            // Input fields
            TextField("Enter first number", text: $num1)
                .keyboardType(.numberPad)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
            
            TextField("Enter second number", text: $num2)
                .keyboardType(.numberPad)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
                        
            Button(action: {
                print("Rust to the rescue..")
                guard let num1 = Int32(num1), let num2 = Int32(num2) else {
                    resultText = "Please enter valid numbers."
                    return
                }
                let sum = add_numbers(num1, num2)
                resultText = "\(sum)"
                
            }) {
                Text("Rust On!")
                    .padding()
                    .background(Color.yellow)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
            Text("Result from Rust: \(resultText)")
        }
        .padding()
    }
}



#Preview {
    ContentView()
}
