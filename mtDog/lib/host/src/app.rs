mod common;
mod diabetes;
mod prover;

use std::{error::Error, fs};
use egui::{RichText, Vec2};
use log::info;
use prover::run_prover;
use std::{collections::HashMap, thread};

fn run() {
    println!("Starting computation");
    let thread_join_handle = thread::spawn(move || run_prover());
    // some work here
    println!("Awaiting computation");
    let res = thread_join_handle.join();
    println!("Completed computation");
}

#[derive(serde::Deserialize, serde::Serialize, Clone)]
struct Passport {
    passport_id: String,
    filename_hash: String,
    data_hash: String,
    nillion_data: HashMap<String,String>
}


/// We derive Deserialize/Serialize so we can persist app state on shutdown.
#[derive(serde::Deserialize, serde::Serialize, Clone)]
#[serde(default)]
// if we add new fields, give them default values when deserializing old state

pub struct TemplateApp {
    data: Option<String>,
    passport: Option<Passport>
}

impl Default for TemplateApp {
    fn default() -> Self {
        Self {
            data: None,
            passport: None
        }
    }
}

impl TemplateApp {
    /// Called once before the first frame.
    pub fn new(cc: &eframe::CreationContext<'_>) -> Self {
        // This is also where you can customize the look and feel of egui using
        // `cc.egui_ctx.set_visuals` and `cc.egui_ctx.set_fonts`.

        // Load previous app state (if any).
        // Note that you must enable the `persistence` feature for this to work.
        if let Some(storage) = cc.storage {
            return eframe::get_value(storage, eframe::APP_KEY).unwrap_or_default();
        }

        Default::default()
    }

    pub fn load_passport(&mut self, path: &str)  {
         if let Ok(contents) = fs::read_to_string(path) {
            if let Ok(passport) = serde_json::from_str::<Passport>(&contents) {
                self.passport = Some(passport);
                return;
            }            
         }
         self.passport = None;
         return;         
    }

    pub fn load_data(&mut self) {        
    }
}



impl eframe::App for TemplateApp {
    /// Called by the frame work to save state before shutdown.
    fn save(&mut self, storage: &mut dyn eframe::Storage) {
        eframe::set_value(storage, eframe::APP_KEY, self);
    }

    /// Called each time the UI needs repainting, which may be many times per second.
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Put your widgets into a `SidePanel`, `TopBottomPanel`, `CentralPanel`, `Window` or `Area`.
        // For inspiration and more examples, go to https://emilk.github.io/egui

        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
            // The top panel is often a good place for a menu bar:

            egui::menu::bar(ui, |ui| {
                // NOTE: no File->Quit on web pages!
                let is_web = cfg!(target_arch = "wasm32");
                if !is_web {
                    ui.menu_button("File", |ui| {
                        if ui.button("Quit").clicked() {
                            ctx.send_viewport_cmd(egui::ViewportCommand::Close);
                        }
                    });
                    ui.add_space(16.0);
                }

                egui::widgets::global_dark_light_mode_buttons(ui);
            });
        });

        egui::CentralPanel::default().show(ctx, |ui| {
            // The central panel the region left after adding TopPanel's and SidePanel's
            ui.horizontal(|ui| {
                let image = egui::Image::new(egui::include_image!("../../assets/icon.png"))
                    .rounding(10.0)
                    .fit_to_original_size(1.0)
                    .max_size(Vec2::new(96.0, 96.0));
                ui.add(image);
                ui.vertical(|ui| {
                    ui.heading(RichText::new("mtDog").size(36.0));
                    ui.heading(RichText::new("Genomic Analysis Tool").size(14.0));
                });
            });

            ui.separator();

            // Step 1 
            ui.vertical(|ui| {
                ui.heading("Step 1: Genetic Passport");                
                ui.horizontal_wrapped(|ui| {
                    egui::SidePanel::left("1_left_panel")
                    .resizable(true)
                    .default_width(64.0)
                    .width_range(50.0..=64.0)
                    .show_inside(ui, |ui| {                            
                        egui::ScrollArea::vertical().show(ui, |ui| {
                            let image = egui::Image::new(egui::include_image!("../../assets/passport.png"))
                                .rounding(10.0)
                                .fit_to_original_size(1.0)
                                .max_size(Vec2::new(48.0, 48.0));
                            ui.add(image);
                        });
                    });
        
        
                    egui::SidePanel::right("1_right_panel")
                    .resizable(true)
                    .default_width(150.0)
                    .width_range(80.0..=200.0)
                    .show_inside(ui, |ui| {                            
                        egui::ScrollArea::vertical().show(ui, |ui| {
                            let b = egui::Button::new("Open Passport");
                            let br = ui.add_enabled(true, b);
                            if br.clicked() {
                                if let Some(path) = rfd::FileDialog::new().pick_file() {                                
                                    let path = path.display().to_string();
                                    self.load_passport(&path);
                                }
                            }
                        });
                    });
        
                    egui::CentralPanel::default().show_inside(ui, |ui| {
                        ui. horizontal_wrapped( |ui| {
                        // egui::ScrollArea::vertical().show(ui, |ui| {
                            ui.label("Open your genetic passport file using the button provided below. If you do not have one you can head over the");
                            ui.hyperlink_to("MonadicDNA", "https://github.com/Cryptonomic/MonadicDNA");
                            ui.label("website to create one.");
                        });
                    });
                });
                
            });
            ui.separator();

            ui.vertical(|ui| {
                ui.heading("Step 2: Genetic Data");
                
                ui.horizontal(|ui| {
                    let image = egui::Image::new(egui::include_image!("../../assets/dna.png"))
                        .rounding(10.0)
                        .fit_to_original_size(1.0)
                        .max_size(Vec2::new(48.0, 48.0));
                    ui.add(image);
                    ui.vertical(|ui| {                        
                        ui.horizontal_wrapped(|ui| {
                            ui.label("Open your 23&Me genetic data txt file.");                    
                        });
                        let b = egui::Button::new("Open Genetic Data");
                        let br = ui.add_enabled(true, b);
                        if br.clicked() {
                            self.load_data();
                        }
                    });
                });
                
            });

            ui.separator();
            ui.vertical(|ui| {
                ui.heading("Step 3: Process Genetic Data");
                ui.horizontal(|ui| {
                    let image = egui::Image::new(egui::include_image!("../../assets/cpu.png"))
                        .rounding(10.0)
                        .fit_to_original_size(1.0)
                        .max_size(Vec2::new(48.0, 48.0));
                    ui.add(image);
                    ui.vertical(|ui| {                        
                        ui.horizontal_wrapped(|ui| {
                            ui.label("Press run to generate your diabetes risk profile along with the necessary Cryptographic proofs and attestations. This step uses Risc0's zkVM to process the data.");               
                        });
                        let b = egui::Button::new("Run Risc0 Prover");
                        let br = ui.add_enabled(true, b);
                        if br.clicked() {
                            println!("Button clicked!");
                        }
                    });
                });                
            });

            
            ui.separator();
            ui.vertical(|ui| {
                ui.heading("Step 4: Upload your results");
                ui.horizontal(|ui| {
                    let image = egui::Image::new(egui::include_image!("../../assets/upload.png"))
                        .rounding(10.0)
                        .fit_to_original_size(1.0)
                        .max_size(Vec2::new(48.0, 48.0));
                    ui.add(image);
                    ui.vertical(|ui| {                        
                        ui.horizontal_wrapped(|ui| {
                            ui.label("Upload your results to add attestations to your passport");
                        });
                        let b = egui::Button::new("Upload");
                        let br = ui.add_enabled(true, b);
                        if br.clicked() {
                            println!("Button clicked!");
                        }
                    });
                });                
            });

           
        
            ui.with_layout(egui::Layout::bottom_up(egui::Align::LEFT), |ui| {
                powered_by_egui_and_eframe(ui);
                egui::warn_if_debug_build(ui);
            });
        });
    }
}

fn lorem_ipsum(ui: &mut egui::Ui) {
    ui.with_layout(
        egui::Layout::top_down(egui::Align::LEFT).with_cross_justify(true),
        |ui| {
            ui.label(egui::RichText::new("TEST").small().weak());
            ui.add(egui::Separator::default().grow(8.0));
            ui.label(egui::RichText::new("TEST").small().weak());
        },
    );
}

fn powered_by_egui_and_eframe(ui: &mut egui::Ui) {
    ui.horizontal(|ui| {
        ui.spacing_mut().item_spacing.x = 0.0;
        // ui.label("Powered by ");
        ui.hyperlink_to("MonadicDNA", "https://github.com/Cryptonomic/MonadicDNA");
        ui.label(" by ");
        ui.hyperlink_to("Cryptonomic", "https://www.cryptonomic.tech");
        ui.label(".");
    });
}
