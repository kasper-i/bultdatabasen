#!/usr/bin/env python3

import os
import boto3
from tqdm import tqdm
import argparse

BUCKET = 'bultdatabasen'
TARGET = None

def create_s3_session():
      session = boto3.session.Session()
      return session.client('s3',
                              region_name='ams3',
                              endpoint_url='https://ams3.digitaloceanspaces.com',
                              aws_access_key_id=os.getenv('SPACES_KEY'),
                              aws_secret_access_key=os.getenv('SPACES_SECRET'))

def is_modified(existing_path, item):
      if os.path.getsize(existing_path) != int(item['Size']):
            return True

      return False

def main():
      parser = argparse.ArgumentParser()
      parser.add_argument('--target', dest='target', required=True)

      args = parser.parse_args()
      TARGET = args.target

      if not TARGET.endswith('/'):
            TARGET += '/'

      total_download_size = 0
      items = []

      s3_client = create_s3_session()

      paginator = s3_client.get_paginator('list_objects_v2')
      page_iterator = paginator.paginate(Bucket=BUCKET, Prefix='images/')

      for page in page_iterator:
        if page['KeyCount'] > 0:
            for item in page['Contents']:
                  download_path = TARGET + item['Key']

                  if not os.path.isfile(download_path) or is_modified(download_path, item):
                        total_download_size += int(item['Size'])
                        items.append(item)


      with tqdm(total=total_download_size, unit='B', unit_scale=True, unit_divisor=1000) as pbar:
            def update_progress(bytes):
                  pbar.update(bytes)

            for item in items:
                  download_path = TARGET + item['Key']
                  dirname = os.path.dirname(download_path)

                  if not os.path.isdir(dirname):
                        os.mkdir(dirname)

                  s3_client.download_file(BUCKET, item['Key'], download_path, Callback=update_progress)

main()
  
