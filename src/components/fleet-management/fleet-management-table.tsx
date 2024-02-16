import { Device, DeviceApprovalStatus, DeviceStatus } from "../../generated/client";
import strings from "../../localization/strings";
import GenericUtils from "../../utils/generic-utils";
import LocalizationUtils from "../../utils/localization-utils";
import {
  Circle as CircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFooter,
  GridRenderCellParams,
  GridRowParams,
  fiFI
} from "@mui/x-data-grid";
import { ReactNode, useMemo } from "react";

/**
 * Fleet management table column
 */
export type FleetManagementTableColumn = "name" | "description" | "serialNumber" | "approvalStatus" | "status" | "version" | "usageHours" | "warrantyExpiry" | "lastConnected" | "lastSeen" | "createdAt" | "modifiedAt" | "actions"; 

/**
 * Components properties
 */
interface Props {
  devices: Device[];
  loading: boolean;
  visibleColumns: FleetManagementTableColumn[];
  loadDevices: () => Promise<void>;
  setSelectedDevice: (device?: Device) => void;
  setDeviceToDelete: (device?: Device) => void;
}

/**
 * Fleet Management Table component
 */
const FleetManagementTable = ({
  devices,
  visibleColumns,
  loading,
  loadDevices,
  setSelectedDevice,
  setDeviceToDelete
}: Props) => {
  /**
   * Gets correct icon for device status
   *
   * @param status status
   * @returns appropriate icon
   */
  const renderDeviceStatusIcon = ({ row: { status } }: GridRenderCellParams<Device>): ReactNode => {
    if (status === DeviceStatus.Online) {
      return <CircleIcon color="success" />;
    }

    return <CircleIcon color="error" />;
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        flex: 2,
        headerName: strings.fleetManagement.properties.name
      },
      {
        field: "description",
        flex: 1,
        headerName: strings.fleetManagement.properties.description
      },
      {
        field: "serialNumber",
        flex: 1,
        headerName: strings.fleetManagement.properties.serialNumber
      },
      {
        field: "approvalStatus",
        headerName: strings.fleetManagement.properties.approvalStatus.label,
        flex: 1,
        valueGetter: ({ value }: { value: DeviceApprovalStatus }) =>
          LocalizationUtils.getLocalizedDeviceApprovalStatus(value)
      },
      {
        field: "version",
        headerName: strings.fleetManagement.properties.version,
        flex: 1
      },
      {
        field: "usageHours",
        headerName: strings.fleetManagement.properties.usageHours,
        flex: 1,
        valueGetter: ({ value }: { value: number }) => `${GenericUtils.roundNumber(value)} h`
      },
      {
        field: "warrantyExpiry",
        headerName: strings.fleetManagement.properties.warrantyExpiry,
        flex: 1,
        valueGetter: ({ value }: { value: string }) => GenericUtils.formatDate(value)
      },
      {
        field: "lastConnected",
        headerName: strings.fleetManagement.properties.lastConnected,
        flex: 1,
        valueGetter: ({ value }: { value: string }) => GenericUtils.formatDateTime(value)
      },
      {
        field: "lastSeen",
        headerName: strings.fleetManagement.properties.lastSeen,
        flex: 1,
        valueGetter: ({ value }: { value: string}) => GenericUtils.formatDateTime(value)
      },
      {
        field: "createdAt",
        headerName: strings.fleetManagement.properties.createdAt,
        flex: 1,
        valueGetter: ({ value }: { value: string}) => GenericUtils.formatDateTime(value)
      },
      {
        field: "modifiedAt",
        headerName: strings.fleetManagement.properties.modifiedAt,
        flex: 1,
        valueGetter: ({ value }: { value: string}) => GenericUtils.formatDateTime(value)
      },
      {
        field: "status",
        headerName: strings.fleetManagement.properties.status.label,
        flex: 0.1,
        renderCell: renderDeviceStatusIcon
      },
      {
        field: "actions",
        type: "actions",
        headerName: strings.generic.actions,
        width: 100,
        getActions: ({ row: { id } }: GridRowParams<Device>) => [
          <GridActionsCellItem
            icon={<EditIcon />}
            label={strings.generic.edit}
            onClick={() => setSelectedDevice(devices.find((device) => device.id === id))}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label={strings.generic.delete}
            onClick={() => setDeviceToDelete(devices.find((device) => device.id === id))}
          />
        ]
      }
    ]
    .filter((column) => visibleColumns.includes(column.field as FleetManagementTableColumn)),
    [devices, visibleColumns, setSelectedDevice, setDeviceToDelete]
  );

  const renderFooter = () => (
    <Stack direction="row" justifyContent="space-between">
      <IconButton disabled={loading} onClick={loadDevices}>
        <RefreshIcon />
      </IconButton>
      <GridFooter />
    </Stack>
  );

  return (
    <DataGrid
      autoHeight
      columns={columns}
      loading={loading}
      rows={devices}
      disableColumnMenu
      slots={{
        footer: renderFooter
      }}
      localeText={fiFI.components.MuiDataGrid.defaultProps.localeText}
    />
  );
};

export default FleetManagementTable;
