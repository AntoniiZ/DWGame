export var settings = 
{
    /// map size & objects count
    'size': [6000, 6000],
    'amountOfRandomObjects': 300,
    /// drawing & stroke
    'strokeLineWidth': 6,
    'strokeRGBAdjustment': [15, 15, 15],
    'drawShapesAlpha': 0.9,
    ////player
    'playerSpawnCoordsRange': [-3000, 3000],
    'playerMinRadius': 25,
    'playerRadius': 64,
    'playerSpeed': 5,
    'playerColor': 0xaffffa,
    'playerWallRadiusReductionCoef': 1.21125,
    ///food
    'foodRadiusRange': [15, 35],
    'foodColorRange': [
        [49, 49], 
        [95, 175], 
        [50, 50]
    ],
    ///walls
    'wallsRadiusRange': [30, 50],
    'wallsColorRange': [
        [255, 255], 
        [94, 154], 
        [30, 30]
    ],
    ///explosion
    'explosionRadiusAdjustmentValue': 1.5,
    'explosionInitialRadius': 10,
    'explosionColorRange': 0xff0000,
}