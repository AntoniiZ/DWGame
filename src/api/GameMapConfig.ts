export var settings = 
{
    /// map size & objects count
    'size': [3000, 3000],
    'gridStep': 100,
    'amountOfObjectsPerPlayer': 50,
    /// drawing & stroke
    'strokeLineWidth': 6,
    'strokeRGBAdjustment': [15, 15, 15],
    'drawShapesAlpha': 0.9,
    ////player
    'playerSpawnCoordsRange': [-1500, 1500],
    'playerMinRadius': 25,
    'playerRadius': 64,
    'playerSpeed': 5,
    'playerColorRange': [
        [175, 175],
        [115, 255],
        [250, 250]
    ],
    'playerWallRadiusReductionCoef': 1.11125,
    ///food
    'foodRadiusRange': [15, 35],
    'foodColorRange': [
        [49, 49], 
        [95, 175], 
        [50, 50]
    ],
    ///walls
    'wallsRadiusRange': [40, 50],
    'wallsColorRange': [
        [255, 255], 
        [94, 154], 
        [30, 30]
    ],
    ///explosion
    'explosionRadiusAdjustmentValue': 1.5,
    'explosionInitialRadius': 10,
    'explosionColorRange': 0xff0000,
    ///time win conditions
    'maxSecondsForGame': 60,
    'multiplierScoreForWinner': 2,
    'multiplierScoreForLoser': 0.5
}