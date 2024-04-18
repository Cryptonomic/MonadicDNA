mod common;
mod diabetes;
mod prover;

use std::fs;
use egui::{RichText, Vec2};
use prover::run_prover;
use reqwest::StatusCode;
use std::{collections::HashMap, thread};
use common::SnpRaw;
use prover::load_genome_data;
use prover::RiskResults;
use reqwest::blocking::Client;


static UPLOAD_URL: &str = "https://whale-app-5mf8b.ondigitalocean.app/sign/VerifiedTrait";

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
struct Passport {
    passport_id: String,
    filename_hash: String,
    data_hash: String,
    nillion_data: HashMap<String,String>
    
}

#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
struct SignProtocolInteractor {
    passport_id: String,
    provider: String,
    t_trait: String,
    value: String,
}

/// We derive Deserialize/Serialize so we can persist app state on shutdown.
#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
#[serde(default)]
// if we add new fields, give them default values when deserializing old state

pub struct TemplateApp {
    data: Option<Vec<SnpRaw>>,
    passport: Option<Passport>,
    results: Option<RiskResults>,    
    upload_complete: bool
    
}

impl Default for TemplateApp {
    fn default() -> Self {
        Self {
            data: None,
            passport: None,
            results: None,
            upload_complete: false
        }
    }
}

impl TemplateApp {
    /// Called once before the first frame.
    pub fn new(_cc: &eframe::CreationContext<'_>) -> Self {
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

    pub fn load_data(&mut self, path: &str) {           
        if let Ok(data) = load_genome_data(&path) {
            println!("Size: {}", data.len());
            self.data = Some(data);            
            return;
        }
        
        self.data = None;
        return;           
    }

    pub fn run_prover(&mut self,) {
        if let Some(data) = self.data.clone() {
            println!("Starting computation");        
            let thread_join_handle = thread::spawn(move || run_prover(data));
            
            println!("Awaiting computation");
            let res = thread_join_handle.join().unwrap();
            if let Ok(results) = res { 
                self.results = Some(results);
            }
            println!("Completed computation");
        }
    }
    

    pub fn upload(&mut self) {
        if let Some(results) =  self.results.clone() {
            let value : String = serde_json::to_string(&results).unwrap();
            let body_data = SignProtocolInteractor  {
                passport_id : self.passport.clone().unwrap().passport_id,
                provider: "mtDog".to_owned(),
                t_trait: "Type2Diabetes".to_owned(),
                value
            };

            let body: String = serde_json::to_string(&body_data).unwrap();
            let body = body.replace("t_trait", "trait");
            println!("POST Data : {}", body.clone());

            let result = Client::new()
                    .post(UPLOAD_URL)            
                    .body(body)                    
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")                    
                    .send();                    
            match result {
                Ok(response) => {
                    println!("Status: {}", response.status());
                    if response.status() == StatusCode::OK {
                        self.upload_complete = true;                        
                        println!("Response: {:?}", response.bytes());
                    }
                }
                Err(err) => {
                    println!("Error {:?}", err);
                }
            }
        }
    }
}



impl eframe::App for TemplateApp {
    
    fn save(&mut self, _storage: &mut dyn eframe::Storage) {
    }

    /// Called each time the UI needs repainting, which may be many times per second.
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        let blank_tick = egui::Image::new(egui::include_image!("../../assets/grey_tick.png"))
            .rounding(10.0)
            .fit_to_original_size(1.0)
            .max_size(Vec2::new(24.0, 24.0));
        let green_tick = egui::Image::new(egui::include_image!("../../assets/green_tick.png"))
            .rounding(10.0)
            .fit_to_original_size(1.0)
            .max_size(Vec2::new(24.0, 24.0));

        egui::TopBottomPanel::top("top_panel").show(ctx, |ui| {
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
                    ui.heading(RichText::new("Genomic Analysis Tool").size(16.0));
                    ui.label(RichText::new("* Results for demonstration only and not fit for medical and diagnostic use.").small());
                });
            });

            // Step 1 
            ui.separator();
            ui.vertical(|ui| {
                ui.heading("Step 1: Genetic Passport");                
                ui.horizontal_wrapped(|ui| {
                    egui::SidePanel::left("1_left_panel")
                        .resizable(true)
                        .default_width(64.0)
                        .width_range(50.0..=64.0)
                        .show_separator_line(false)
                        .show_inside(ui, |ui| {                            
                            let image = egui::Image::new(egui::include_image!("../../assets/passport.png"))
                                .rounding(10.0)
                                .fit_to_original_size(1.0)
                                .max_size(Vec2::new(48.0, 48.0));
                            ui.add(image);
                    });
        
                    egui::SidePanel::right("1_right_panel")
                        .resizable(true)
                        .default_width(150.0)
                        .width_range(80.0..=200.0)
                        .show_separator_line(false)
                        .show_inside(ui, |ui| {                            
                            egui::SidePanel::right("aaa").show_inside(ui, |ui| {       
                                let b = egui::Button::new("Open Passport");
                                let br = ui.add_enabled(true, b);
                                if br.clicked() {
                                    if let Some(path) = rfd::FileDialog::new().pick_file() {                                
                                        let path = path.display().to_string();
                                        self.load_passport(&path);
                                    }
                                }
                                if self.passport.is_some() {
                                    ui.add(green_tick.clone());                                    
                                }
                                else {
                                    ui.add(blank_tick.clone());
                                }
                            });
                    });
        
                    egui::CentralPanel::default()                    
                    .show_inside(ui, |ui| {
                        ui. horizontal_wrapped( |ui| {
                        // egui::ScrollArea::vertical().show(ui, |ui| {
                            ui.label("Open your genetic passport file using the button provided. If you do not have one then head over to the");
                            ui.hyperlink_to("MonadicDNA", "https://github.com/Cryptonomic/MonadicDNA");
                            ui.label("website to create one.");
                        });
                    });
                });                
            });

            // Step 2
            ui.separator();            
            ui.vertical(|ui| {
                ui.heading("Step 2: Genetic Data");
                ui.horizontal_wrapped(|ui| {
                    egui::SidePanel::left("2_left_panel")
                    .resizable(true)
                    .default_width(64.0)
                    .width_range(50.0..=64.0)
                    .show_separator_line(false)
                    .show_inside(ui, |ui| {                        
                        let image = egui::Image::new(egui::include_image!("../../assets/dna.png"))
                            .rounding(10.0)
                            .fit_to_original_size(1.0)
                            .max_size(Vec2::new(48.0, 48.0));
                        ui.add(image);                        
                    });
        
                    egui::SidePanel::right("2_right_panel")
                        .resizable(true)                        
                        .default_width(150.0)
                        .width_range(80.0..=200.0)
                        .show_separator_line(false)
                        .show_inside(ui, |ui| {               
                            egui::SidePanel::right("aaa").show_inside(ui, |ui| {                            
                                let b = egui::Button::new("Open Data");
                                if self.passport.is_some() {
                                    let br = ui.add_enabled(true, b);
                                    if br.clicked() {
                                        if let Some(path) = rfd::FileDialog::new().pick_file() {                                
                                            let path = path.display().to_string();
                                            self.load_data(&path);
                                        }                                        
                                    }
                                }
                                else {
                                    ui.add_enabled(false, b);
                                }if self.data.is_some() {
                                    ui.add(green_tick.clone());                                    
                                }
                                else {
                                    ui.add(blank_tick.clone());
                                }                                
                            });
                    });
        
                    egui::CentralPanel::default()                    
                    .show_inside(ui, |ui| {
                        ui. horizontal_wrapped( |ui| {
                            ui.label("Open your 23&Me genetic data txt file.");     
                        });
                    });
                });     
            });

            ui.separator();
            ui.vertical(|ui| {
                ui.heading("Step 3: Process Genetic Data");
                ui.horizontal_wrapped(|ui| {
                    egui::SidePanel::left("3_left_panel")
                    .resizable(true)
                    .default_width(64.0)
                    .width_range(50.0..=64.0)
                    .show_separator_line(false)
                    .show_inside(ui, |ui| {                        
                        let image = egui::Image::new(egui::include_image!("../../assets/cpu.png"))
                            .rounding(10.0)
                            .fit_to_original_size(1.0)
                            .max_size(Vec2::new(48.0, 48.0));
                        ui.add(image);                        
                    });        
        
                    egui::SidePanel::right("3_right_panel")
                        .resizable(true)
                        .default_width(150.0)
                        .width_range(80.0..=200.0)
                        .show_separator_line(false)
                        .show_inside(ui, |ui| {                            
                            egui::SidePanel::right("aaa").show_inside(ui, |ui| {                                
                                let b = egui::Button::new("Run Risc0");
                                if self.data.is_some() {
                                    let br = ui.add_enabled(true, b);
                                    if br.clicked() {
                                        self.run_prover();
                                    }
                                }
                                else {
                                    ui.add_enabled(false, b);
                                }
                                if self.results.is_some() {
                                    ui.add(green_tick.clone());
                                }
                                else {
                                    ui.add(blank_tick.clone());
                                }
                            });
                    });
        
                    egui::CentralPanel::default()                    
                    .show_inside(ui, |ui| {
                        ui. horizontal_wrapped( |ui| {
                            ui.label("Press run to securely generate your diabetes risk profile. This step uses Risc0's zkVM to process the data and produces results that can be cryptographicaly verified.");
                        });
                    });
                });          
                
                ui.horizontal(|ui| {                    
                    let image = egui::Image::new(egui::include_image!("../../assets/blank.png"))
                        .rounding(10.0)
                        .fit_to_original_size(1.0)
                        .max_size(Vec2::new(66.0, 90.0));
                    ui.add(image);                      
                    egui::Frame::default()  
                    .stroke(egui::Stroke::new(1.0, egui::Color32::GRAY))
                    .rounding(14.0)
                    .show(ui,|ui| {          
                            ui.vertical(|ui| {          
                            ui.add_sized([80.0, 20.0], egui::Label::new("Risk Score"));
                            if let Some(results) = self.results.clone() {
                                let text = format!("{}", results.score);
                                ui.add_sized([80.0, 20.0], egui::Label::new(text));
                                if results.score > 1.0 {
                                    let text = RichText::new("At Risk").color(egui::Color32::RED);
                                    ui.add_sized([80.0, 20.0], egui::Label::new(text));     
                                }
                                else {
                                    let text = RichText::new("Normal").color(egui::Color32::GREEN);
                                    ui.add_sized([80.0, 20.0], egui::Label::new(text));     
                                }
                            }else {
                                ui.add_sized([80.0, 20.0], egui::Label::new("----"));
                                ui.add_sized([80.0, 20.0], egui::Label::new("----"));     
                            }
                            });
                    });                                                 
                });
            });

            
            // Step 4
            ui.separator();
            ui.vertical(|ui| {
                ui.heading("Step 4: Upload your results");
                ui.horizontal_wrapped(|ui| {
                    egui::SidePanel::left("4_left_panel")
                    .resizable(true)
                    .default_width(64.0)
                    .width_range(50.0..=64.0)
                    .show_separator_line(false)
                    .show_inside(ui, |ui| {                       
                        let image = egui::Image::new(egui::include_image!("../../assets/upload.png"))
                            .rounding(10.0)
                            .fit_to_original_size(1.0)
                            .max_size(Vec2::new(48.0, 48.0));
                        ui.add(image);                        
                    });
                
                    egui::SidePanel::right("4_right_panel")
                        .resizable(true)
                        .default_width(150.0)
                        .width_range(80.0..=200.0)
                        .show_separator_line(false)
                        .show_inside(ui, |ui| {                                    
                            egui::SidePanel::right("aaa").show_inside(ui, |ui| {                                                
                            let b = egui::Button::new("Upload").wrap(true); 
                            if self.results.is_some() {                           
                                let br = ui.add_enabled(true, b);
                                if br.clicked() {
                                    self.upload();
                                }                
                            }
                            else {
                                ui.add_enabled(false, b);
                            }
                            if self.upload_complete {
                                ui.add(green_tick.clone());
                            }
                            else {
                                ui.add(blank_tick.clone());                                
                            }
                        });            
                    });
        
                    egui::CentralPanel::default()                    
                    .show_inside(ui, |ui| {
                        ui. horizontal_wrapped( |ui| {
                            ui.label("Upload your results to add attestations to your passport. You can view these results on the");
                            ui.hyperlink_to("MonadicDNA", "https://github.com/Cryptonomic/MonadicDNA");
                            ui.label("website.");
                        });
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
