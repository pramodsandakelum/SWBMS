import { Grid, Paper, Typography } from "@mui/material";
import { Map as MapIcon, Assessment, PieChart, TrendingUp, TableChart } from "@mui/icons-material";

import KPICards from "./KPICards";
import FullnessPie from "./FullnessPie";
import BinMap from "./BinMap";
import BinTable from "./BinTable";
import TrendsChart from "./TrendsChart";

const SectionHeader = ({ icon: IconComponent, title, subtitle }) => (
    <div className="p-3 border-b border-slate-700/30">
        <div className="flex items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-2.5">
                <IconComponent className="text-base text-emerald-400" />
            </div>
            <div>
                <Typography variant="h6" className="font-semibold text-slate-50 text-sm">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" className="text-slate-400 text-xs">
                        {subtitle}
                    </Typography>
                )}
            </div>
        </div>
    </div>
);

const StyledPaper = ({ children, className = "" }) => (
    <Paper
        elevation={0}
        className={`w-full h-full bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 ${className}`}
    >
        {children}
    </Paper>
);

const Dashboard = ({ bins }) => (
    <div className="space-y-6">
        {/* Map Section - Full Width */}
        <StyledPaper className="h-[600px] flex flex-col">
            <SectionHeader
                icon={MapIcon}
                title="Real-time Bin Network"
                subtitle="Live monitoring and geospatial analytics"
            />
            <div className="flex-1 relative">
                <BinMap bins={bins} />
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 min-w-24 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                        Active Nodes
                    </p>
                    <p className="text-lg font-bold text-emerald-400 font-mono">
                        {bins.length}
                    </p>
                </div>
            </div>
        </StyledPaper>

        {/* Metrics*/}
        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
                <StyledPaper className="h-[280px] flex flex-col">
                    <SectionHeader
                        icon={Assessment}
                        title="System Metrics"
                        subtitle="Key performance indicators"
                    />
                    <div className="p-3 flex-1">
                        <KPICards bins={bins} />
                    </div>
                </StyledPaper>
            </Grid>

            {/* Pie Chart*/}
            <Grid item xs={12} md={3} lg={3}>
                <StyledPaper className="h-[280px] flex flex-col">
                    <SectionHeader
                        icon={PieChart}
                        title="Capacity Analysis"
                        subtitle="Fullness distribution overview"
                    />
                    <div className="p-3 flex-1">
                        <FullnessPie bins={bins} />
                    </div>
                </StyledPaper>
            </Grid>

            {/* Trends Chart*/}
            <Grid item xs={12} md={3} lg={3}>
                <StyledPaper className="h-[280px] flex flex-col">
                    <SectionHeader
                        icon={TrendingUp}
                        title="Trend Analytics"
                        subtitle="24-hour performance data"
                    />
                    <div className="p-3 flex-1">
                        <TrendsChart bins={bins} />
                    </div>
                </StyledPaper>
            </Grid>
        </Grid>

        {/* Full Width Table Section */}
        <StyledPaper className="h-[500px] flex flex-col">
            <SectionHeader
                icon={TableChart}
                title="Network Status Matrix"
                subtitle="Comprehensive bin status and operational metrics"
            />
            <div className="p-4 flex-1 relative">
                <div className="absolute top-4 right-4 flex items-center bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 z-10">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-emerald-400 text-xs font-medium uppercase tracking-wide">Live Data</span>
                </div>
                <BinTable bins={bins} />
            </div>
        </StyledPaper>
    </div>
);

export default Dashboard;