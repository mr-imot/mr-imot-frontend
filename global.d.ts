/// <reference types="google.maps" />

declare module '@paper-design/shaders-react' {
	import * as React from 'react'

	export interface PaperTextureProps extends React.HTMLAttributes<HTMLDivElement> {
		colorFront?: string
		colorBack?: string
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface MeshGradientProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		speed?: number
		distortion?: number
		swirl?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		scale?: number
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface GodRaysProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface WaterProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		scale?: number
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface GrainGradientProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface StaticMeshGradientProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface DitheringProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		shape?: string
		density?: number
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface WavesProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		scale?: number
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface PerlinNoiseProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		scale?: number
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export interface VoronoiProps extends React.HTMLAttributes<HTMLDivElement> {
		colors?: string[]
		borderColor?: string
		borderWidth?: number
		scale?: number
		speed?: number
		style?: React.CSSProperties
		onError?: () => void
	}

	export const PaperTexture: React.FC<PaperTextureProps>
	export const MeshGradient: React.FC<MeshGradientProps>
	export const DotGrid: React.FC<DotGridProps>
	export const GodRays: React.FC<GodRaysProps>
	export const Water: React.FC<WaterProps>
	export const GrainGradient: React.FC<GrainGradientProps>
	export const StaticMeshGradient: React.FC<StaticMeshGradientProps>
	export const Dithering: React.FC<DitheringProps>
	export const Waves: React.FC<WavesProps>
	export const PerlinNoise: React.FC<PerlinNoiseProps>
	export const Voronoi: React.FC<VoronoiProps>
}

