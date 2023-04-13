resource "google_storage_bucket" "demo-bucket" {
    name = "techday-teamc-demo"
    location = var.google_cloud_default_region

    website {
      main_page_suffix = "index.html"
    }
}