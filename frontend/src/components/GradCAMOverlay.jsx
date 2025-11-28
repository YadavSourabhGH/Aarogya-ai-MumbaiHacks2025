import React, { useEffect, useRef } from 'react';

const GradCAMOverlay = ({ imageUrl, heatmapData }) => {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        if (!heatmapData || !imageUrl) return;

        const canvas = canvasRef.current;
        const image = imageRef.current;

        const drawHeatmap = () => {
            const ctx = canvas.getContext('2d');
            const { width, height } = image;

            canvas.width = width;
            canvas.height = height;

            // Draw the original image
            ctx.drawImage(image, 0, 0, width, height);

            // Draw heatmap coordinates
            if (heatmapData.coordinates && heatmapData.coordinates.length > 0) {
                heatmapData.coordinates.forEach(coord => {
                    const x = coord.x * width;
                    const y = coord.y * height;
                    const radius = 40;

                    // Create radial gradient for heat effect
                    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                    gradient.addColorStop(0, `rgba(255, 0, 0, ${coord.intensity * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${coord.intensity * 0.5})`);
                    gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
                });
            }
        };

        if (image.complete) {
            drawHeatmap();
        } else {
            image.onload = drawHeatmap;
        }
    }, [heatmapData, imageUrl]);

    return (
        <div className="relative">
            <img
                ref={imageRef}
                src={imageUrl}
                alt="Medical imaging"
                className="hidden"
            />
            <canvas
                ref={canvasRef}
                className="w-full rounded-lg border border-gray-200"
            />
            {heatmapData?.suspiciousRegion && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-bold text-red-800">
                        {heatmapData.suspiciousRegion.description}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                        Location: {heatmapData.suspiciousRegion.location}
                    </p>
                </div>
            )}
        </div>
    );
};

export default GradCAMOverlay;
