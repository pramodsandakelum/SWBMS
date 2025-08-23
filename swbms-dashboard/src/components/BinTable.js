// src/components/BinTable.js
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Typography
} from "@mui/material";
import { useMQTT } from "../hooks/useMQTT";

export default function BinTable() {
    const bins = useMQTT("smartbin/data");

    const getStatusChip = (fullness) => {
        if (fullness >= 80) return <Chip label="Full" color="error" />;
        if (fullness >= 40) return <Chip label="Half" color="warning" />;
        return <Chip label="Normal" color="success" />;
    };

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>

                        <TableCell><b>Location</b></TableCell>
                        <TableCell><b>Weight (kg)</b></TableCell>
                        <TableCell><b>Fullness (%)</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bins.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Typography align="center">Waiting for bin data...</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        bins.map((bin) => (
                            <TableRow key={bin.id}>

                                <TableCell>{bin.location_name}</TableCell>
                                <TableCell>{bin.weight}</TableCell>
                                <TableCell>{bin.fullness}</TableCell>
                                <TableCell>{getStatusChip(bin.fullness)}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
