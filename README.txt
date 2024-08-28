Set up Gmail for ngocxit1284@gmail.com:
    1. Go to your Google Account settings.
        1.1. Navigate to "Security" > Click on "2-Step Verification".
        1.2. Enter one by one step to register verification

    2. After turn on "2-Step Verification", on the Search input tag, enter "App passwords.",
        --> Create a app name such as "nodemailer-test"
        --> A password will be genereated

    3. Search "Less secure apps & your Google Account"

Create "vercel.json" if we want to upload on Vercel
*************
{
    "version": 2,
    "builds": [
      {
        "src": "server.js",
        "use": "@vercel/node"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/server.js"
      }
    ]
  }
  
*************

Stock App: https://github.com/jturtler/next_stock_tracker
Stock Notification service: https://github.com/chauthutran/nodejs-stock-tracker-service