import os
import urllib.request

import boto3
from PIL import Image

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

def main(args):
      image_id = args.get("imageId")
      sizes = args.get("sizes")

      session = boto3.session.Session()
      s3_client = session.client('s3',
                              region_name='ams3',
                              endpoint_url='https://ams3.digitaloceanspaces.com',
                              aws_access_key_id=os.getenv('SPACES_KEY'),
                              aws_secret_access_key=os.getenv('SPACES_SECRET'))

      urllib.request.urlretrieve(f'https://bultdatabasen.ams3.digitaloceanspaces.com/images/{image_id}', ORIG_FILE)

      try:
            with Image.open(ORIG_FILE) as im:
                  for size in sizes:
                        resize(im, SIZE_TABLE[size])
                        
                        s3_client.upload_file(TEMP_FILE, 'bultdatabasen', f'images/{image_id}.{size}',
                              ExtraArgs={
                                    'ACL': 'public-read',
                                    'ContentType': 'image/jpeg'
                        })
      except Exception as e:
            raise e
      finally:
            if os.path.exists(ORIG_FILE):
                  os.remove(ORIG_FILE)
            if os.path.exists(TEMP_FILE):
                  os.remove(TEMP_FILE)

      return dict(body=None)
