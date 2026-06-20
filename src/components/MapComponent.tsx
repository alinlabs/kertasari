import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function ResettableMarker({ rotation }: { rotation: number }) {
  const map = useMap();
  return (
    <Marker
      position={[-6.653664, 107.481764]}
      eventHandlers={{
        click: () => {
          map.flyTo([-6.651664, 107.481764], 12.5);
        },
      }}
    >
      <Popup>
        <div
          className="text-center font-sans tracking-normal transition-transform duration-500 origin-center"
          style={{ transform: `rotate(${-rotation}deg)` }}
        >
          <strong>Desa Kertasari</strong>
          <br />
          <span className="text-sm">Kec. Bojong, Kab. Purwakarta</span>
        </div>
      </Popup>
    </Marker>
  );
}
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  RotateCw,
  Download,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Settings,
  Target,
  ExternalLink,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import kertasariBoundary from "../kertasari-boundary.json";

// Fix typical React-Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export function MapComponent() {
  const [mapType, setMapType] = useState<
    "standar" | "satelit" | "jalan" | "medan" | "tipografi"
  >("standar");
  const [showMarker, setShowMarker] = useState(true);
  const [showAreaColor, setShowAreaColor] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const exportMapRef = useRef<HTMLDivElement>(null);
  const [isDownloadingArea, setIsDownloadingArea] = useState<boolean>(false);
  const [downloadFormatOpen, setDownloadFormatOpen] = useState<boolean>(false);
  const [enableExportMask, setEnableExportMask] = useState<boolean>(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Create an inverted mask to hide everything outside Kertasari when downloading
  const maskGeoJson = useMemo(() => {
    if (!kertasariBoundary || !kertasariBoundary.coordinates) return null;
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
            [180, -90],
          ],
          kertasariBoundary.coordinates[0],
        ],
      },
    };
  }, []);

  const handleDownloadArea = async (format: "png" | "pdf") => {
    try {
      setDownloadFormatOpen(false);
      setIsDownloadingArea(true);
      setEnableExportMask(true);

      // Wait a small tick of 150ms for React state to apply and the hidden map wrapper to render in the DOM
      await new Promise((r) => setTimeout(r, 150));

      if (!exportMapRef.current) {
        throw new Error("Target export element not mounted in DOM yet.");
      }

      // Wait for mask and extremely high res new tiles to load inside the hidden large container
      await new Promise((r) => setTimeout(r, 4350));

      const dataUrl = await htmlToImage.toPng(exportMapRef.current, {
        pixelRatio: 2, // High detail over a huge container
        quality: 1,
        cacheBust: true,
        backgroundColor: format === "pdf" ? "#ffffff" : "transparent",
        filter: (node) => {
          // Filter out UI buttons during capture
          if (node instanceof Element) {
            if (
              node.classList.contains("hide-on-export") ||
              node.classList.contains("leaflet-control-container") ||
              node.classList.contains("leaflet-marker-pane") ||
              node.classList.contains("leaflet-shadow-pane")
            ) {
              return false;
            }
          }
          return true;
        },
      });

      if (format === "png") {
        const link = document.createElement("a");
        link.download = "peta-kertasari.png";
        link.href = dataUrl;
        link.click();
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: "a3",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Get image properties to maintain aspect ratio
        const imgProps = pdf.getImageProperties(dataUrl);
        const ratio = imgProps.width / imgProps.height;

        let finalWidth = pdfWidth;
        let finalHeight = finalWidth / ratio;

        if (finalHeight > pdfHeight) {
          finalHeight = pdfHeight;
          finalWidth = finalHeight * ratio;
        }

        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(dataUrl, "PNG", x, y, finalWidth, finalHeight, "", "FAST");
        pdf.save("peta-kertasari.pdf");
      }
    } catch (e) {
      console.error("Export area fail", e);
    } finally {
      setEnableExportMask(false);
      setIsDownloadingArea(false);
    }
  };

  const renderMapLayers = (
    InteractiveMapContainer: any,
    isInteractive: boolean,
    forcedZoom: number = 12.5,
    customKeyAddon: string = "",
  ) => (
    <InteractiveMapContainer
      key={`map-${isInteractive}-${resetCounter}-${customKeyAddon}`}
      center={[-6.651664, 107.481764]}
      zoom={forcedZoom}
      zoomSnap={0.2}
      scrollWheelZoom={isInteractive}
      dragging={isInteractive}
      touchZoom={isInteractive}
      doubleClickZoom={isInteractive}
      zoomControl={isInteractive}
      attributionControl={false}
      className={`w-full h-full relative ${isInteractive ? "z-0" : "z-0"}`}
    >
      <TileLayer
        key={`standar-${enableExportMask}`}
        url={
          enableExportMask
            ? "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            : "https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}"
        }
        opacity={mapType === "standar" ? 1 : 0}
      />
      <TileLayer
        key={`satelit-${enableExportMask}`}
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        opacity={mapType === "satelit" ? 1 : 0}
      />
      <TileLayer
        key={`jalan-${enableExportMask}`}
        url={
          enableExportMask
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        }
        opacity={mapType === "jalan" ? 1 : 0}
      />
      <TileLayer
        key={`medan-${enableExportMask}`}
        url={
          enableExportMask
            ? "https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}"
            : "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
        }
        opacity={mapType === "medan" ? 1 : 0}
      />
      <TileLayer
        key={`tipografi-${enableExportMask}`}
        url={
          enableExportMask
            ? "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        }
        opacity={mapType === "tipografi" ? 1 : 0}
      />

      {/* Export Mask for isolating only Kertasari */}
      {enableExportMask && maskGeoJson && (
        <GeoJSON
          // @ts-ignore
          data={maskGeoJson}
          pathOptions={{
            fillColor: "#ffffff",
            fillOpacity: 1,
            weight: 0,
            fillRule: "evenodd",
          }}
        />
      )}

      {/* Boundary Kertasari */}
      {showBoundary && kertasariBoundary && !enableExportMask && (
        <GeoJSON
          key={`boundary-${showAreaColor}`}
          data={kertasariBoundary as any}
          pathOptions={{
            color: "#dc2626", // red-600
            weight: 3,
            dashArray: "8, 6",
            fillColor: showAreaColor ? "#ef4444" : "transparent",
            fillOpacity: showAreaColor ? 0.3 : 0,
          }}
        />
      )}

      {/* Marker only inside the area with Kertasari text */}
      {showMarker && !enableExportMask && (
        <ResettableMarker rotation={rotation} />
      )}
    </InteractiveMapContainer>
  );

  return (
    <div className="w-full mt-4 md:mt-8 flex flex-col space-y-4 relative">
      <div className="relative">
        <div
          ref={mapWrapperRef}
          onClick={() => setIsModalOpen(true)}
          className={`w-full aspect-[4/3] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100 relative cursor-pointer group bg-slate-100`}
          style={{ zIndex: 0 }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-[150%] max-w-none pb-[150%] transition-transform duration-500 ease-in-out pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            <div className="absolute inset-0">
              {renderMapLayers(MapContainer, false)}
            </div>
          </div>
          <div className="absolute inset-0 z-[400] bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-auto" />
        </div>

        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet / Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-end md:justify-center items-center p-0 md:p-6 text-left">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                />

                {/* Modal / Bottom Sheet Content */}
                <motion.div
                  initial={{ y: "100%", opacity: 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 1 }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
                  className="bg-white w-full md:w-[500px] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[75dvh] md:max-h-[75dvh] relative z-10 pointer-events-auto will-change-transform overflow-hidden"
                >
                  {/* Fixed Map at Top */}
                  <div className="w-full aspect-square md:aspect-auto md:h-72 relative flex-shrink-0 bg-slate-100 overflow-hidden rounded-t-3xl md:rounded-t-3xl">
                    <div
                      className="absolute top-1/2 left-1/2 w-[150%] max-w-none pb-[150%] transition-transform duration-500 ease-in-out pointer-events-auto"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      }}
                    >
                      <div className="absolute inset-0">
                        {renderMapLayers(MapContainer, true)}
                      </div>
                    </div>

                    {/* Dark gradient overlay for text visibility */}
                    <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/60 to-transparent z-[350] pointer-events-none rounded-t-3xl md:rounded-t-3xl hide-on-export"></div>

                    {/* Floating Icons overlaid on map */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between z-[400] pointer-events-none mt-2 hide-on-export">
                      <a
                        href="https://share.google/COOtRL2g1NoXnlsRK"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 pointer-events-auto drop-shadow-md hover:drop-shadow-lg transition-all group/link"
                        title="Buka di Google Maps"
                      >
                        <h3 className="font-bold text-white text-[17px] md:text-[16px] tracking-tight flex items-center gap-1.5">
                          Desa Kertasari
                          <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                        </h3>
                      </a>

                      <div className="flex flex-row pointer-events-auto items-center">
                        <button
                          onClick={() => {
                            setRotation(0);
                            setResetCounter((c) => c + 1);
                          }}
                          className="p-2 text-white hover:text-slate-200 transition-colors outline-none drop-shadow-md"
                          title="Reset Tampilan"
                        >
                          <Target className="w-5 h-5 md:w-[18px] md:h-[18px] drop-shadow-sm" />
                        </button>
                        <button
                          onClick={() => setRotation((r) => r + 90)}
                          className="p-2 text-white hover:text-slate-200 transition-colors outline-none drop-shadow-md hide-on-export"
                          title="Putar Peta"
                        >
                          <RotateCw className="w-5 h-5 md:w-[18px] md:h-[18px] drop-shadow-sm" />
                        </button>
                        <div className="relative hide-on-export flex">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDownloadFormatOpen(!downloadFormatOpen);
                            }}
                            disabled={isDownloadingArea}
                            className="p-2 text-white hover:text-slate-200 transition-colors disabled:opacity-50 outline-none drop-shadow-md"
                            title="Download Area"
                          >
                            {isDownloadingArea ? (
                              <Loader2 className="w-5 h-5 md:w-[18px] md:h-[18px] animate-spin drop-shadow-sm" />
                            ) : (
                              <Download className="w-5 h-5 md:w-[18px] md:h-[18px] drop-shadow-sm" />
                            )}
                          </button>

                          {downloadFormatOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 w-44 z-[500] flex flex-col">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadArea("png");
                                }}
                                disabled={isDownloadingArea}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors border-b border-slate-100"
                              >
                                Download as PNG
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadArea("pdf");
                                }}
                                disabled={isDownloadingArea}
                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                              >
                                Download as PDF
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Options Below Map */}
                  <div
                    className="flex-1 overflow-y-auto w-full hide-scrollbar flex flex-col bg-white"
                    id="opsi-section"
                  >
                    <div className="p-6 flex flex-col gap-8 pb-10">
                      {/* Map Type */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Tampilan
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {(
                            ["medan", "satelit", "jalan", "tipografi"] as const
                          ).map((t) => (
                            <button
                              key={t}
                              onClick={() =>
                                setMapType((prev) =>
                                  prev === t ? "standar" : t,
                                )
                              }
                              className={`px-1 py-2 text-[11px] sm:text-xs rounded-xl font-medium transition-all capitalize ${
                                mapType === t
                                  ? "bg-brand-50 text-brand-600 border border-brand-100"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Opsi
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setShowMarker(!showMarker)}
                            className={`px-1 py-2 text-[11px] sm:text-xs rounded-xl font-medium transition-all ${
                              showMarker
                                ? "bg-brand-50 text-brand-600 border border-brand-100"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Point Lokasi
                          </button>
                          <button
                            onClick={() => setShowBoundary(!showBoundary)}
                            className={`px-1 py-2 text-[11px] sm:text-xs rounded-xl font-medium transition-all ${
                              showBoundary
                                ? "bg-brand-50 text-brand-600 border border-brand-100"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Batas Wilayah
                          </button>
                          <button
                            onClick={() => setShowAreaColor(!showAreaColor)}
                            disabled={!showBoundary}
                            className={`px-1 py-2 text-[11px] sm:text-xs rounded-xl font-medium transition-all ${
                              !showBoundary
                                ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
                                : showAreaColor
                                  ? "bg-brand-50 text-brand-600 border border-brand-100"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Batas Area
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* Hidden Huge Map for Exporting Only */}
      {enableExportMask && (
        <div
          ref={exportMapRef}
          className="fixed top-[-9999px] left-[-9999px] w-[2560px] h-[1440px] z-[-100] bg-white pointer-events-none"
        >
          {renderMapLayers(MapContainer, false, 14.5, "export")}
        </div>
      )}
    </div>
  );
}
