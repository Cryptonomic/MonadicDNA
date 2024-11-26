//
//  ContentView.swift
//  monadic_ios
//
//  Created by Aisha Opaluwa on 26/11/2024.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Button(action: {
                print("Rust to the rescue..")
            }) {
                Text("Rust On!")
                    .padding()
                    .background(Color.yellow)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
