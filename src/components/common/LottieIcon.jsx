import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const LottieIcon = ({ src, alt, className }) => {
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        fetch(src)
            .then((response) => response.json())
            .then((data) => setAnimationData(data))
            .catch((error) => console.error(`Error loading Lottie animation from ${src}:`, error));
    }, [src]);

    if (!animationData) {
        return <div className={className} style={{ background: '#f0f0f0', borderRadius: '50%' }} aria-label={alt}></div>; // Placeholder
    }

    return (
        <Lottie
            animationData={animationData}
            loop={true}
            className={className}
            aria-label={alt}
        />
    );
};

export default LottieIcon;
