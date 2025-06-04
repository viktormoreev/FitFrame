import React, { useEffect, useRef } from 'react';

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface Connection {
  from: string;
  to: string;
}

interface PoseVisualizerProps {
  landmarks: Record<string, Landmark>;
  connections: Connection[];
  imageWidth: number;
  imageHeight: number;
  imageUrl: string;
}

const PoseVisualizer: React.FC<PoseVisualizerProps> = ({ 
  landmarks, 
  connections, 
  imageWidth, 
  imageHeight,
  imageUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Colors for different body parts
  const colors = {
    torso: 'rgba(255, 0, 0, 0.8)',      // Red
    leftArm: 'rgba(0, 255, 0, 0.8)',    // Green
    rightArm: 'rgba(0, 0, 255, 0.8)',   // Blue
    leftLeg: 'rgba(255, 255, 0, 0.8)',  // Yellow
    rightLeg: 'rgba(255, 0, 255, 0.8)', // Purple
    face: 'rgba(0, 255, 255, 0.8)',     // Cyan
    default: 'rgba(255, 255, 255, 0.8)' // White
  };

  const getConnectionColor = (from: string, to: string): string => {
    if (from.includes('LEFT_SHOULDER') || from.includes('LEFT_ELBOW') || from.includes('LEFT_WRIST')) {
      return colors.leftArm;
    } else if (from.includes('RIGHT_SHOULDER') || from.includes('RIGHT_ELBOW') || from.includes('RIGHT_WRIST')) {
      return colors.rightArm;
    } else if (from.includes('LEFT_HIP') || from.includes('LEFT_KNEE') || from.includes('LEFT_ANKLE')) {
      return colors.leftLeg;
    } else if (from.includes('RIGHT_HIP') || from.includes('RIGHT_KNEE') || from.includes('RIGHT_ANKLE')) {
      return colors.rightLeg;
    } else if (from.includes('NOSE') || from.includes('EYE') || from.includes('EAR') || from.includes('MOUTH')) {
      return colors.face;
    } else if (
      (from.includes('SHOULDER') && to.includes('SHOULDER')) ||
      (from.includes('HIP') && to.includes('HIP')) ||
      (from.includes('SHOULDER') && to.includes('HIP'))
    ) {
      return colors.torso;
    }
    return colors.default;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks || Object.keys(landmarks).length === 0) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections first (lines between landmarks)
    if (connections) {
      connections.forEach(connection => {
        const from = landmarks[connection.from];
        const to = landmarks[connection.to];
        
        if (from && to && from.visibility > 0.5 && to.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = getConnectionColor(connection.from, connection.to);
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    }

    // Draw landmarks (points)
    Object.entries(landmarks).forEach(([name, landmark]) => {
      if (landmark.visibility > 0.5) {
        // Draw circle for each landmark
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Add labels for key points
    const keyPoints = [
      'NOSE', 'LEFT_SHOULDER', 'RIGHT_SHOULDER', 
      'LEFT_ELBOW', 'RIGHT_ELBOW', 'LEFT_WRIST', 'RIGHT_WRIST',
      'LEFT_HIP', 'RIGHT_HIP', 'LEFT_KNEE', 'RIGHT_KNEE',
      'LEFT_ANKLE', 'RIGHT_ANKLE'
    ];

    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.5;
    
    keyPoints.forEach(pointName => {
      const point = landmarks[pointName];
      if (point && point.visibility > 0.5) {
        const label = pointName.replace('_', ' ');
        const textWidth = ctx.measureText(label).width;
        ctx.fillText(label, point.x - textWidth / 2, point.y - 10);
        ctx.strokeText(label, point.x - textWidth / 2, point.y - 10);
      }
    });

  }, [landmarks, connections, imageWidth, imageHeight]);

  return (
    <div className="pose-visualizer" style={{ position: 'relative', maxWidth: '100%', maxHeight: '600px' }}>
      <img 
        src={imageUrl} 
        alt="Pose detection" 
        style={{ display: 'block', maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} 
      />
      <canvas 
        ref={canvasRef} 
        width={imageWidth} 
        height={imageHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default PoseVisualizer;