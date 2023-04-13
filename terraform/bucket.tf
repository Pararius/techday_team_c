resource "google_storage_bucket" "demo-bucket" {
  name     = "techday-teamc-demo"
  location = var.google_cloud_default_region

  uniform_bucket_level_access = false

  website {
    main_page_suffix = "index.html"
  }
}

resource "google_storage_default_object_access_control" "public_rule" {
  bucket = google_storage_bucket.demo-bucket.name
  role   = "READER"
  entity = "allUsers"
}
