import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [angle, setAngle] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setPoints([]);
      setAngle(null);
      
      // Create new image to get dimensions
      const img = new Image();
      img.src = url;
      img.onload = () => {
        imageRef.current = img;
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          drawCanvas();
        }
      };
    }
  };

  const calculateAngle = (points: Point[]) => {
    if (points.length !== 3) return null;

    const [p1, p2, p3] = points;
    
    // Calculate vectors
    const vector1 = {
      x: p2.x - p1.x,
      y: p2.y - p1.y
    };
    
    const vector2 = {
      x: p2.x - p3.x,
      y: p2.y - p3.y
    };

    // Calculate dot product
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    // Calculate angle in radians and convert to degrees
    const angleRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
    return (angleRadians * 180) / Math.PI;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (points.length >= 3) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);
    
    if (newPoints.length === 3) {
      const calculatedAngle = calculateAngle(newPoints);
      setAngle(calculatedAngle);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(imageRef.current, 0, 0);

    // Draw points and lines
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();

      if (index === 1 && points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (index === 2) {
        ctx.beginPath();
        ctx.moveTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const handleClear = () => {
    setPoints([]);
    setAngle(null);
    drawCanvas();
  };

  useEffect(() => {
    drawCanvas();
  }, [points]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-6">Medidor de Ángulos</h1>
          
          <div className="mb-6">
            <label className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-400">Selecciona una imagen</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {imageUrl && (
            <div className="space-y-4">
              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-full border border-gray-600 rounded"
                  style={{ cursor: points.length < 3 ? 'crosshair' : 'default' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-white">
                  {angle !== null ? (
                    <p className="text-xl">Ángulo: {angle.toFixed(2)}°</p>
                  ) : (
                    <p className="text-gray-400">
                      {points.length < 3
                        ? `Selecciona ${3 - points.length} punto${
                            points.length === 2 ? '' : 's'
                          } más`
                        : ''}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleClear}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Borrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;