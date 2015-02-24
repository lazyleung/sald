import bpy

for obj in bpy.data.objects:
	if obj.name == "Crate":
		print(obj.name)
		print(obj.data)
		print(obj.data.loops)
		for v in obj.data.vertices:
			print(v.co)

		poly = obj.data.polygons

		for poly in obj.data.polygons:
			if(poly.loop_total == 3):
				print(poly)