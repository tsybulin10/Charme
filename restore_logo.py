import base64

png_path = "/Users/tsybulin/Desktop/Crown.png"
target_path = "/Users/tsybulin/Desktop/charme-beauty/src/Crown.svg"

with open(png_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

svg_content = f"""<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="body_1" width="416" height="269">

<g transform="matrix(1.3333334 0 0 1.3333334 0 0)">
	<image  x="0" y="0" xlink:href="data:image/png;base64,{encoded_string}" />
</g>
</svg>
"""

with open(target_path, "w", encoding="utf-8") as out_file:
    out_file.write(svg_content)

print(f"SUCCESS: Recreated Crown.svg from Crown.png. Size: {len(svg_content)} characters")
