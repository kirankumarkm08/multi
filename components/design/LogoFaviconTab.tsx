<TabsContent value="logo" className="space-y-6">
<Card>
  <CardHeader>
    <CardTitle>Logo & Favicon Upload</CardTitle>
    <CardDescription>Upload your brand logo</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <Label htmlFor="logo-upload">Logo</Label>
      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {logoPreview ? (
          <div className="space-y-4">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="mx-auto h-32 w-auto object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLogoFile(null);
                setLogoPreview("");
              }}
            >
              Remove Logo
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your logo here, or click to browse
            </p>
            {/* <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, SVG up to 5MB
            </p> */}
          </>
        )}
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="hidden"
        />
        {!logoPreview && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() =>
              document.getElementById("logo-upload")?.click()
            }
          >
            Upload Logo
          </Button>
        )}
      </div>
    </div>
    <div>
      <Label htmlFor="favicon-upload">Favicon</Label>
      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {faviconPreview ? (
          <div className="space-y-4">
            <img
              src={faviconPreview}
              alt="Favicon preview"
              className="mx-auto h-16 w-16 object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFaviconFile(null);
                setFaviconPreview("");
              }}
            >
              Remove Favicon
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your favicon here, or click to
              browse
            </p>
          </>
        )}
        <input
          id="favicon-upload"
          type="file"
          accept="image/*"
          onChange={handleFaviconChange}
          className="hidden"
        />
        {!faviconPreview && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() =>
              document.getElementById("favicon-upload")?.click()
            }
          >
            Upload Favicon
          </Button>
        )}
      </div>
    </div>

    {/* <div>
      <Label htmlFor="banner-upload">Banner</Label>
      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {bannerPreview ? (
          <div className="space-y-4">
            <img
              src={bannerPreview}
              alt="Banner preview"
              className="mx-auto h-32 w-auto object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBannerFile(null);
                setBannerPreview("");
              }}
            >
              Remove Banner
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your banner here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 5MB
            </p>
          </>
        )}
        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className="hidden"
        />
        {!bannerPreview && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() =>
              document.getElementById("banner-upload")?.click()
            }
          >
            Select Banner
          </Button>
        )}
      </div>
    </div> */}
  </CardContent>
</Card>
</TabsContent>
