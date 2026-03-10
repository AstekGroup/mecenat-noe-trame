import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import Map, { Marker, Popup, ScaleControl, Source, Layer } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useMapViewport, useClusters } from '@/hooks';
import { ProjectsGeoJSON, Project, isProjectCluster, ProjectMapFeature } from '@/types/project';
import { ClusterMarker } from './ClusterMarker';
import { ProjectMarker } from './ProjectMarker';
import { ProjectPopup } from './ProjectPopup';
import { MAP_STYLES } from './MapStyleSelector';
import { DOMTOMInset } from './DOMTOMInset';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';

interface MapViewProps {
  geojson: ProjectsGeoJSON;
  natura2000Data?: any;
  showNatura2000?: boolean;
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  hoveredProject: Project | null;
  onHoverProject: (project: Project | null) => void;
  onViewProjectDetails?: (projectId: string) => void;
  onMapFlyToReady?: (flyTo: (lng: number, lat: number, zoom?: number) => void) => void;
}

export function MapView({
  geojson,
  natura2000Data,
  showNatura2000,
  selectedProject,
  onSelectProject,
  hoveredProject,
  onHoverProject,
  onViewProjectDetails,
  onMapFlyToReady,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const { viewport, onMove } = useMapViewport();
  const [bounds, setBounds] = useState<{
    west: number;
    south: number;
    east: number;
    north: number;
  } | null>(null);

  const currentStyleUrl = MAP_STYLES.find(s => s.id === 'liberty')?.url || MAP_STYLES[0].url;

  const smoothFlyTo = useCallback((lng: number, lat: number, zoom?: number) => {
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [lng, lat],
        zoom: zoom ?? map.getZoom(),
        duration: 1200,
        essential: true,
      });
    }
  }, []);

  useEffect(() => {
    if (onMapFlyToReady) {
      onMapFlyToReady(smoothFlyTo);
    }
  }, [onMapFlyToReady, smoothFlyTo]);

  const onMapLoad = useCallback(() => {
    onMoveEnd();
  }, []);

  const onMoveEnd = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      const b = map.getBounds();
      if (b) {
        setBounds({
          west: b.getWest(),
          south: b.getSouth(),
          east: b.getEast(),
          north: b.getNorth(),
        });
      }
    }
  }, []);

  const { clusters, getClusterExpansionZoom } = useClusters(
    geojson,
    bounds,
    viewport.zoom
  );

  const handleClusterClick = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      const expansionZoom = getClusterExpansionZoom(clusterId);
      smoothFlyTo(longitude, latitude, expansionZoom);
    },
    [getClusterExpansionZoom, smoothFlyTo]
  );

  const handleProjectClick = useCallback(
    (feature: ProjectMapFeature) => {
      if (!isProjectCluster(feature)) {
        const project = feature.properties;
        onSelectProject(project);
        smoothFlyTo(
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
          Math.max(viewport.zoom, 12)
        );
      }
    },
    [onSelectProject, smoothFlyTo, viewport.zoom]
  );

  const popupCoordinates = useMemo(() => {
    if (!selectedProject) return null;
    return {
      longitude: selectedProject.longitude,
      latitude: selectedProject.latitude,
    };
  }, [selectedProject]);

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        onLoad={onMapLoad}
        mapStyle={currentStyleUrl}
        style={{ width: '100%', height: '100%' }}
        minZoom={3}
        maxZoom={18}
        attributionControl={false}
      >
        <ScaleControl position="bottom-left" />

        {/* Couche Natura 2000 */}
        {showNatura2000 && natura2000Data && (
          <Source id="natura2000" type="geojson" data={natura2000Data}>
            <Layer
              id="natura2000-fill"
              type="fill"
              paint={{
                'fill-color': '#2e7d32',
                'fill-opacity': 0.3,
              }}
            />
            <Layer
              id="natura2000-outline"
              type="line"
              paint={{
                'line-color': '#ffffff',
                'line-width': 1,
                'line-opacity': 0.5,
              }}
            />
          </Source>
        )}

        {clusters.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          
          if (isProjectCluster(feature)) {
            return (
              <Marker
                key={`cluster-${feature.id}`}
                longitude={longitude}
                latitude={latitude}
              >
                <ClusterMarker
                  count={feature.properties.point_count}
                  onClick={() =>
                    handleClusterClick(feature.properties.cluster_id, longitude, latitude)
                  }
                />
              </Marker>
            );
          }

          const project = feature.properties;
          const isSelected = selectedProject?.id === project.id;
          const isHovered = hoveredProject?.id === project.id;

          return (
            <Marker
              key={`project-${project.id}`}
              longitude={longitude}
              latitude={latitude}
            >
              <ProjectMarker
                type={project.type}
                isSelected={isSelected || isHovered}
                onClick={() => handleProjectClick(feature)}
                onMouseEnter={() => onHoverProject(project)}
                onMouseLeave={() => onHoverProject(null)}
              />
            </Marker>
          );
        })}

        {selectedProject && popupCoordinates && (
          <Popup
            longitude={popupCoordinates.longitude}
            latitude={popupCoordinates.latitude}
            anchor="bottom"
            onClose={() => onSelectProject(null)}
            closeButton={false}
            closeOnClick={false}
            offset={25}
            maxWidth="340px"
          >
            <ProjectPopup 
              project={selectedProject} 
              onClose={() => onSelectProject(null)} 
              onViewDetails={onViewProjectDetails}
            />
          </Popup>
        )}
      </Map>

      <div className="absolute top-20 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const map = mapRef.current;
            if (map) {
              const currentZoom = map.getZoom();
              map.flyTo({ zoom: Math.min(currentZoom + 1, 18), duration: 300 });
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-card flex items-center justify-center text-primary hover:bg-surface-beige transition-colors"
          aria-label="Zoomer"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const map = mapRef.current;
            if (map) {
              const currentZoom = map.getZoom();
              map.flyTo({ zoom: Math.max(currentZoom - 1, 3), duration: 300 });
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-card flex items-center justify-center text-primary hover:bg-surface-beige transition-colors"
          aria-label="Dézoomer"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const map = mapRef.current;
            if (map) {
              map.flyTo({
                center: [2.2137, 46.2276],
                zoom: 5.5,
                duration: 1200,
              });
            }
          }}
          className="w-10 h-10 bg-white rounded-lg shadow-card flex items-center justify-center text-primary hover:bg-surface-beige transition-colors"
          aria-label="Recentrer la carte"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      <DOMTOMInset
        geojson={geojson as any}
        mapStyleUrl={currentStyleUrl}
        onEventClick={(eventId) => {
          const project = geojson.features.find(f => f.properties.id === eventId);
          if (project) {
            onSelectProject(project.properties);
            smoothFlyTo(project.properties.longitude, project.properties.latitude, 14);
          }
        }}
        onTerritoryClick={(territory) => {
          smoothFlyTo(territory.center.lng, territory.center.lat, territory.zoom);
        }}
      />
    </div>
  );
}
