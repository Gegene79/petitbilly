from PIL import Image
import exifread
import pymongo
import os
import glob
from pprint import pprint
IMAGES_PATH='/Users/fabien/Pictures/essai'
THUMBS_PATH='/Users/fabien/Pictures/thumbs'

files = glob.glob(IMAGES_PATH + '/**/*.jpg',recursive=True)
files.extend(glob.glob(IMAGES_PATH + '/**/*.JPG',recursive=True))
fotos_fs = set(files)

thumbs = glob.glob(THUMBS_PATH + '/**/s_*.jpg',recursive=True)
thumbs.extend(glob.glob(THUMBS_PATH + '/**/s_*.JPG',recursive=True))
thumbs_fs = set()
for thumb in thumbs:
    print(thumb.replace(THUMBS_PATH,IMAGES_PATH,1).replace("/s_","/",1))
    thumbs_fs.add(thumb.replace(THUMBS_PATH,IMAGES_PATH,1).replace("/s_","/",1))

# for image in files:
#     print(image)
#     #im = Image.open(image)
#     #exifdata = im._getexif()
#     #print(exifdata)
#     f = open(image,'rb')
#     tags = exifread.process_file(f)
#     if 'JPEGThumbnail' in tags:
#         tags.pop('JPEGThumbnail')
#     print(tags)

client = pymongo.MongoClient('mongodb://petitbilly:27017/')
db = client.dbmetric
c_fotos = db['images-test']
fotos_db = set()
for foto in c_fotos.find({},{'_id':0,'path':1}):
    print(foto['path'])
    fotos_db.add(foto['path'])


# Images in DB but not in file system
del_db =  fotos_db - fotos_fs
print('Delete from DB: ' + repr(del_db))
dict_del_db = {'_id':key for key in del_db}
c_fotos.delete_many(dict_del_db)

# Thumbnails but no original photo
del_thumb = thumbs_fs - fotos_fs
print('Delete thumbnails: ' + repr(del_thumb))

# Images on file system but no thumbnails
create_thumb = fotos_fs - thumbs_fs
print('Create thumbnails: ' + repr(create_thumb))

# Images on file system but not in db
create_db = fotos_fs - fotos_db
print('Insert into db: ' + repr(create_db))


