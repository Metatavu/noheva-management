import { SvgIcon } from "@mui/material";

/**
 * Renders parent tree icon
 */
const ParentTreeIcon = () => {
  return (
    <SvgIcon fontSize="large" sx={{ alignSelf: "center", justifySelf: "center" }}>
      <path
        d="M0.766699 12.5839C1.0917 12.9089 1.6167 12.9089 1.9417 12.5839L4.00003 10.5256L6.05837 12.5839C6.38337 12.9089 6.90837 12.9089 7.23337 12.5839C7.55837 12.2589 7.55837 11.7339 7.23337 11.4089L4.5917 8.76727C4.2667 8.44227 3.7417 8.44227 3.4167 8.76727L0.775033 11.4089C0.441699 11.7256 0.441699 12.2589 0.766699 12.5839ZM7.23337 0.417273C6.90837 0.092273 6.38337 0.092273 6.05837 0.417273L4.00003 2.47561L1.9417 0.417273C1.6167 0.092273 1.0917 0.092273 0.766699 0.417273C0.441699 0.742273 0.441699 1.27561 0.766699 1.60061L3.40837 4.24227C3.73337 4.56727 4.25837 4.56727 4.58337 4.24227L7.22503 1.60061C7.55836 1.27561 7.55837 0.742273 7.23337 0.417273Z"
        fill="#2196F3"
      />
    </SvgIcon>
  );
};

export default ParentTreeIcon;
