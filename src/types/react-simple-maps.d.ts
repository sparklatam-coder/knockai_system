declare module "react-simple-maps" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    children?: ReactNode;
  }

  interface GeographyStyleObject {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    cursor?: string;
    outline?: string;
    transition?: string;
    opacity?: number;
  }

  interface GeographyProps {
    geography: {
      rsmKey: string;
      properties: Record<string, unknown>;
    };
    style?: {
      default?: GeographyStyleObject;
      hover?: GeographyStyleObject;
      pressed?: GeographyStyleObject;
    };
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  }

  interface GeographiesChildrenArgs {
    geographies: Array<{
      rsmKey: string;
      properties: Record<string, unknown>;
      [key: string]: unknown;
    }>;
  }

  interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (args: GeographiesChildrenArgs) => ReactNode;
    parseGeographies?: (geos: GeographiesChildrenArgs["geographies"]) => GeographiesChildrenArgs["geographies"];
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
