import os
import urllib.request

from PIL import Image
import requests

ORIG_FILE = "in"
TEMP_FILE = "out.jpg"
SIZE_TABLE = {
	"xs": 300,
	"sm": 500,
	"md": 750,
	"lg": 1000,
	"xl": 1500,
	"2xl": 2500
}

def resize(im, size):
      width, height = im.size

      if width > height:
            scale = (size / float(width))
            target = (size, int((float(height) * float(scale))))
      else:
            scale = (size / float(height))
            target = (int((float(width) * float(scale))), size)

      im = im.resize(target, Image.ANTIALIAS)
      im.save(TEMP_FILE)

def upload(file, upload_url):
      requests.put(upload_url, headers={
          'x-amz-acl':    'public-read',
          'Content-Type': 'image/jpeg',
      }, data=open(file, 'rb'))

def main(args):
      download_url = args.get("downloadUrl")
      versions = args.get("versions")

      urllib.request.urlretrieve(download_url, ORIG_FILE)

      try:
            with Image.open(ORIG_FILE) as im:
                  for version, upload_url in versions.items():
                        resize(im, SIZE_TABLE[version])
                        upload(TEMP_FILE, upload_url)
                        
      except Exception as e:
            raise e
      finally:
            if os.path.exists(ORIG_FILE):
                  os.remove(ORIG_FILE)
            if os.path.exists(TEMP_FILE):
                  os.remove(TEMP_FILE)

      return dict(body=None)
  
