// Game Engine Programming jkleung1
// https://github.com/lazyleung/sald-jkleung1


/* Circle vs Circle
 * INPUT: two circles specified by position and radius:
 *  c1 = {x:, y:, r:}, c2 = {x:, y:, r:}
 * RETURN VALUE:
 *  false if c1 and c2 do not intersect
 *  true if c1 and c2 do intersect
 */
function circleCircle(c1,c2) {
	var d = Math.pow((c1.x - c2.x), 2) + Math.pow((c1.y - c2.y), 2);
	return d < Math.pow((c1.r + c2.r), 2);
}

/* Rectangle vs Rectangle
 * INPUT: rectangles specified by their minimum and maximum extents:
 *  r = {min:{x:, y:}, max:{x:, y:}}
 * RETURN VALUE:
 *  false if r1 and r2 do not intersect
 *  true if r1 and r2 do intersect
 */
function rectangleRectangle(r1, r2) {
	xOverlap = false;
	yOverlap = false;

	if(r1.min.x < r2.min.x && r1.max.x > r2.min.x) 
	{
		// r1 to the left of r2
		// r1 has a section that overlaps with r2
		xOverlap = true;
	} else if(r2.min.x < r1.min.x && r2.max.x > r1.min.x) {
		// r2 to the left of r1
		// r2 has a section that overlaps with r1
		xOverlap = true;
	}

	if(r1.min.y < r2.min.y && r1.max.y > r2.min.y)
	{
		// r1 below r2
		// r1 has a section that overlaps with r2
		yOverlap = true;
	} else if(r2.min.y < r1.min.y && r2.max.y > r1.min.y) {
		// r2 below r1
		// r2 has a section that overlaps with r1
		yOverlap = true;
	}

	if(xOverlap && yOverlap)
	{
		return true;
	}

	return false;
}

/* Convex vs Convex
 * INPUT: convex polygons as lists of vertices in CCW order
 *  p = [{x:,y:}, ..., {x:, y:}]
 * RETURN VALUE:
 *  false if p1 and p2 do not intersect
 *  true if p1 and p2 do intersect
 */
function convexConvex(p1, p2) {
	for(var i = 0; i < p1.length; i++)
	{
		// Get edge of polygon 
		var x, y;
		if(i + 1 < p1.length)
		{
			x = p1[i].x - p1[i + 1].x;
			y = p1[i].y - p1[i + 1].y;
		} else {
			x = p1[i].x - p1[0].x;
			y = p1[i].y - p1[0].y;
		}

		// Get perpendicular of edge to be new axis
		var temp = x;
		x = y;
		y = -temp;

		// Project shape on to axis
		var p1Min = Number.POSITIVE_INFINITY;
		var p1Max = Number.NEGATIVE_INFINITY;

		var p2Min = Number.POSITIVE_INFINITY;
		var p2Max = Number.NEGATIVE_INFINITY;

		for(var j = 0; j < p1.length; j++)
		{
			var p = 0.0;

			p = p1[j].x * x + p1[j].y * y;

			if(p < p1Min)
			{
				p1Min = p;
			}
			if(p > p1Max)
			{
				p1Max = p;
			}
		}

		for(var j = 0; j < p2.length; j++)
		{
			var p = 0.0;

			p = p2[j].x * x + p2[j].y * y;

			if(p < p2Min)
			{
				p2Min = p;
			}
			if(p > p2Max)
			{
				p2Max = p;
			}
		}
		if(p1Min < p2Min && p1Max > p2Min)
		{
			// Overlap
		} else if(p2Min < p1Min && p2Max > p1Min) {
			// Overlap
		} else {
			return false;
		}
	}

	for(var i = 0; i < p2.length; i++)
	{
		// Get edge of polygon 
		var x, y;
		if(i + 1 < p2.length)
		{
			x = p2[i].x - p2[i + 1].x;
			y = p2[i].y - p2[i + 1].y;
		} else {
			x = p2[i].x - p2[0].x;
			y = p2[i].y - p2[0].y;
		}

		// Get perpendicular of edge to be new axis
		var temp = x;
		x = y;
		y = -temp;

		// Project shape on to axis
		var p1Min = Number.POSITIVE_INFINITY;
		var p1Max = Number.NEGATIVE_INFINITY;

		var p2Min = Number.POSITIVE_INFINITY;
		var p2Max = Number.NEGATIVE_INFINITY;

		for(var j = 0; j < p1.length; j++)
		{
			var p = 0.0;

			p = p1[j].x * x + p1[j].y * y;

			if(p < p1Min)
			{
				p1Min = p;
			}
			if(p > p1Max)
			{
				p1Max = p;
			}
		}

		for(var j = 0; j < p2.length; j++)
		{
			var p = 0.0;

			p = p2[j].x * x + p2[j].y * y;

			if(p < p2Min)
			{
				p2Min = p;
			}
			if(p > p2Max)
			{
				p2Max = p;
			}
		}

		if(p1Min < p2Min && p1Max > p2Min)
		{
			// Overlap
		} else if(p2Min < p1Min && p2Max > p1Min)
		{
			// Overlap
		} else {
			return false;
		}
	}
	return true;
}

/* Rav vs Circle
 * INPUT: ray specified as a start and end point, circle as above.
 *  ray = {start:{x:, y:}, end:{x:, y:}}
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayCircle(r, c) {
	var dx = r.end.x - r.start.x;
	var dy = r.end.y - r.start.y;
	var dd2 = dx * dx + dy * dy;
	
	var Dx = r.start.x - c.x;
	var Dy = r.start.y - c.y;
	var Dd2 = Dx * Dx + Dy * Dy;

	var a = Math.pow((dx * Dx + dy * Dy), 2) - dd2 * (Dd2 - c.r * c.r);

	if(a < 0)
		return null;

	if(a === 0)
	{
		var t = (-(dx * Dx + dy * Dy)) / dd2;
		return {'t':t};
	}

	var t1 = (-(dx * Dx + dy * Dy) + Math.sqrt(a)) / dd2;
	var t2 = (-(dx * Dx + dy * Dy) - Math.sqrt(a)) / dd2;

	if((t1 < t2 || t2  < 0.0) && t1 >= 0.0 && t1 <= 1.0)
		return {'t':t1};
	if((t2 <= t1 || t1  < 0.0) && t2 >= 0.0 && t2 <= 1.0)
		return {'t':t2};

	return null;
}

/* Rav vs Rectangle
 * INPUT: ray as above, rectangle as above.
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayRectangle(r, b) {
	//TODO
	// Get edge of polygon 
	var x, y;
	x = r.start.x - r.end.x;
	y = r.start.y - r.end.y;

	// Get perpendicular of edge to be new axis
	var temp = x;
	x = y;
	y = -temp;

	return null;
}

/* Rav vs Convex
 * INPUT: ray as above, convex polygon as above.
 * RETURN VALUE:
 *  null if no intersection
 *  {t:} if intersection
 *    -- NOTE: 0.0 <= t <= 1.0 gives the position of the first intersection
 */
function rayConvex(r, p) {
	var x, y;
	x = r.start.x - r.end.x;
	y = r.start.y - r.end.y;

	// Get perpendicular of edge to be new axis
	var temp = x;
	x = y;
	y = -temp;

	var left = 0;
	var right = 0; 

	for(var i = 0; i < p.length; i++)
	{
		var dp = ((r.end.x - r.start.x)*(p[i].y - r.start.y) - (r.end.y - r.start.y)*(p[i].x - r.start.x));

		//var dp = x * p[i].x + y * p[i].y;

		if(dp > 0)
			left++;
		else if (dp < 0)
			right++;
	}

	if(left > 0 && right > 0)
	{
		return {'t':0.5};
	}

	return null;

	// for(var i = 0; i < p.length; i++)
	// {
	// 	// Get edge of polygon 
	// 	var x, y;
	// 	if(i + 1 < p.length)
	// 	{
	// 		x = p[i].x - p[i + 1].x;
	// 		y = p[i].y - p[i + 1].y;
	// 	} else {
	// 		x = p[i].x - p[0].x;
	// 		y = p[i].y - p[0].y;
	// 	}

	// 	// Get perpendicular of edge to be new axis
	// 	var temp = x;
	// 	x = y;
	// 	y = -temp;

	// 	var d = Math.sprt(x * x + y * y)
	// 	x = x/d;
	// 	y = y/d;

	// 	// Project ray point on to axis
	// 	for(var i = 0.0; i <== 1.0 ; i = i + 0.01)
	// 	{
	// 		var p = 

	// 		var min = Number.POSITIVE_INFINITY;
	// 		var max = Number.NEGATIVE_INFINITY;

	// 		for(var j = 0; j < p.length; j++)
	// 		{
	// 			var p = 0.0;

	// 			p = p[j].x * x + p[j].y * y;

	// 			if(p < min)
	// 			{
	// 				p1Min = p;
	// 			}
	// 			if(p > max)
	// 			{
	// 				max = p;
	// 			}
	// 		}

	// 		if(min < p2Min && p1Max > p2Min)
	// 		{
	// 			// Overlap
	// 		} else if(p2Min < p1Min && p2Max > p1Min) {
	// 			// Overlap
	// 		} else {
	// 			return false;
	// 		}
	// 	}

			
		
	// }

	return null;
}


module.exports = {
	circleCircle: circleCircle,
	rectangleRectangle: rectangleRectangle,
	convexConvex: convexConvex,
	rayCircle: rayCircle,
	rayRectangle: rayRectangle,
	rayConvex: rayConvex
};
