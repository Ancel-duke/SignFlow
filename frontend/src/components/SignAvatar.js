import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { getAnimationParams } from '../utils/animationSystem';
import './SignAvatar.css';

// Avatar component with advanced animation and micro-expressions
function Avatar({ animationSequence, isAnimating, speed = 1.0, variationParams, currentWord }) {
  const meshRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftHandRef = useRef();
  const rightHandRef = useRef();
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const timeRef = useRef(0);
  const currentAnimationIndex = useRef(0);
  const animationStartTime = useRef(0);
  const blinkTimerRef = useRef(0);
  const idleTimerRef = useRef(0);

  useEffect(() => {
    if (animationSequence && animationSequence.sequence && animationSequence.sequence.length > 0) {
      timeRef.current = 0;
      currentAnimationIndex.current = 0;
      animationStartTime.current = 0;
    }
  }, [animationSequence]);

  useFrame((state, delta) => {
    if (!isAnimating || !animationSequence || !animationSequence.sequence) return;
    
    const sequence = animationSequence.sequence;
    if (sequence.length === 0) return;

    timeRef.current += delta * speed;
    const currentItem = sequence[currentAnimationIndex.current];
    
    if (!currentItem) return;

    // Check if we should move to next animation
    const itemElapsed = timeRef.current - animationStartTime.current;
    if (itemElapsed >= currentItem.duration && currentAnimationIndex.current < sequence.length - 1) {
      currentAnimationIndex.current++;
      animationStartTime.current = timeRef.current;
    }

    // Get animation parameters for current frame
    const animParams = getAnimationParams(
      sequence[currentAnimationIndex.current],
      itemElapsed
    );

    // Apply animations to body
    if (meshRef.current) {
      meshRef.current.rotation.y = animParams.bodyRotation;
      meshRef.current.position.y = animParams.bodyVertical;
    }

    // Apply animations to arms
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = animParams.leftArmRotation;
      leftArmRef.current.rotation.x = Math.sin(timeRef.current * 3) * 0.2;
    }
    
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = animParams.rightArmRotation;
      rightArmRef.current.rotation.x = Math.sin(timeRef.current * 3 + 0.5) * 0.2;
    }

    // Apply hand position variations
    if (leftHandRef.current) {
      leftHandRef.current.position.x = -0.4 + animParams.handPosition.left;
      leftHandRef.current.position.y = -0.1 + Math.sin(timeRef.current * 4) * 0.05;
    }
    
    if (rightHandRef.current) {
      rightHandRef.current.position.x = 0.4 + animParams.handPosition.right;
      rightHandRef.current.position.y = -0.1 + Math.sin(timeRef.current * 4 + 0.3) * 0.05;
    }

    // Apply subtle facial expression (head movement)
    if (headRef.current) {
      headRef.current.rotation.x = animParams.expression * 0.3;
      headRef.current.rotation.y = Math.sin(timeRef.current * 1.5) * animParams.expression * 0.2;
      
      // Subtle head nods during signing
      const nodFrequency = 0.8;
      headRef.current.rotation.z = Math.sin(timeRef.current * nodFrequency) * 0.05;
    }

    // Micro-expressions: Eye blinks (every 3-5 seconds)
    blinkTimerRef.current += delta;
    if (blinkTimerRef.current > 3 + Math.random() * 2) {
      blinkTimerRef.current = 0;
      // Trigger blink animation
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 0.1;
        rightEyeRef.current.scale.y = 0.1;
        setTimeout(() => {
          if (leftEyeRef.current && rightEyeRef.current) {
            leftEyeRef.current.scale.y = 1;
            rightEyeRef.current.scale.y = 1;
          }
        }, 150);
      }
    }

    // Idle body shifts (subtle weight shifts)
    idleTimerRef.current += delta;
    if (meshRef.current && !isAnimating) {
      const shiftAmount = Math.sin(idleTimerRef.current * 0.5) * 0.02;
      meshRef.current.position.x = shiftAmount;
    }
  });

  return (
    <group ref={meshRef} position={[0, -1, 0]}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.08, 1.55, 0.25]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.08, 1.55, 0.25]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color="#5B7FA6" />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.4, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#4A6B8F" />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.4, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#4A6B8F" />
      </mesh>
      
      {/* Left Hand */}
      <mesh ref={leftHandRef} position={[-0.4, -0.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Right Hand */}
      <mesh ref={rightHandRef} position={[0.4, -0.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, -0.8, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      <mesh position={[0.15, -0.8, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
    </group>
  );
}

const SignAvatar = ({ text, animationSequence, isAnimating, speed = 1.0, tone = 'neutral', playbackSpeed = 'normal', currentWord = null, onHandHover = null }) => {
  const [hoveredPart, setHoveredPart] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleHandHover = (part, event) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    }
    setHoveredPart(part);
    if (onHandHover) onHandHover(part);
  };

  const handleHandLeave = () => {
    setHoveredPart(null);
    if (onHandHover) onHandHover(null);
  };

  useEffect(() => {
    if (containerRef.current) {
      if (isAnimating) {
        containerRef.current.classList.add('animating');
      } else {
        containerRef.current.classList.remove('animating');
      }
    }
  }, [isAnimating]);

  return (
    <div 
      ref={containerRef}
      className={`sign-avatar-container ${isAnimating ? 'animating' : ''}`}
      role="img" 
      aria-label={`Avatar signing: ${text || 'Ready to translate'}`}
    >
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />
        
        <Avatar 
          animationSequence={animationSequence} 
          isAnimating={isAnimating}
          speed={speed}
          variationParams={animationSequence?.variationParams}
          currentWord={currentWord}
        />
      </Canvas>
      
      {/* Interactive hover tooltips */}
      {hoveredPart && (
        <div 
          className="avatar-tooltip"
          style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
        >
          <p className="tooltip-text">
            {hoveredPart === 'leftHand' && 'Left hand: Expressing gesture'}
            {hoveredPart === 'rightHand' && 'Right hand: Dominant signing hand'}
            {hoveredPart === 'face' && 'Facial expression: Conveying emotion'}
          </p>
        </div>
      )}
      
      {text && (
        <div className="avatar-text-overlay">
          <p className="avatar-text">{text}</p>
          {currentWord && (
            <p className="current-word-indicator">Signing: <strong>{currentWord}</strong></p>
          )}
        </div>
      )}
    </div>
  );
};

export default SignAvatar;
