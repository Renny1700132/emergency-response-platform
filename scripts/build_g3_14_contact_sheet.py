from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root=Path(__file__).resolve().parents[1]/"logs/reviews/G3-14_render"
files=sorted(root.glob("current-page-*.png"),key=lambda p:int(p.stem.rsplit("-",1)[1]))
thumbs=[]
for i,p in enumerate(files,1):
    im=Image.open(p).convert("RGB"); im.thumbnail((360,510)); canvas=Image.new("RGB",(380,550),"white"); canvas.paste(im,((380-im.width)//2,25)); ImageDraw.Draw(canvas).text((10,5),f"Page {i}",fill="black"); thumbs.append(canvas)
sheet=Image.new("RGB",(380*4,550*2),(220,220,220))
for i,im in enumerate(thumbs): sheet.paste(im,((i%4)*380,(i//4)*550))
sheet.save(root/"current-contact.png")
