import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, Select, MenuItem, Button } from '@mui/material';
import { get } from 'react-hook-form';
import { DAY_LABELS, SUBSCRIPTION } from './mockdata';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const calculateEndDate = (startDate, planType, planCount, deliveryDays) => {
  if (!startDate || !planType || !planCount) return null;
  
  const start = new Date(startDate);
  let daysToAdd = 0;
  
  switch (planType) {
    case SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.WEEKLY:
      daysToAdd = planCount * 7;
      break;
    case SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.BIWEEKLY:
      daysToAdd = planCount * 14;
      break;
    case SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.MONTHLY:
      daysToAdd = planCount * 30;
      break;
    default:
      return null;
  }
  
  return addDays(start, daysToAdd - 1);
};

const calculateTotalDeliveries = (startDate, endDate, deliveryDays) => {
  if (!startDate || !endDate || !deliveryDays) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (deliveryDays[dayOfWeek] > 0) {
      count += deliveryDays[dayOfWeek];
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

const getAggregatedDeliveryDays = (mealPlans) => {
  const aggregated = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  if (!mealPlans || !mealPlans.length) return aggregated;
  
  mealPlans.forEach(plan => {
    if (plan?.days) {
      Object.keys(plan.days).forEach(day => {
        aggregated[day] = Math.max(aggregated[day], plan.days[day] || 0);
      });
    }
  });
  
  return aggregated;
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

// Text field component using MUI TextField (matches production app)
const BaseTextField = ({ 
  id, 
  name, 
  label, 
  errors, 
  validate, 
  required = true, 
  disabled = false,
  type = 'text',
  multiline = false,
  rows = 1,
  helperText = '',
  startAdornment = null,
  onChange,
  value,
}) => {
  // Use react-hook-form's get helper for nested paths like 'customer.firstName'
  const error = get(errors, name);
  
  return (
    <TextField
      fullWidth
      id={id}
      name={name}
      label={label}
      required={required}
      disabled={disabled}
      type={type}
      multiline={multiline}
      rows={rows}
      value={value || ''}
      onChange={onChange}
      error={!!error}
      helperText={error?.message || helperText}
      slotProps={{
        inputLabel: { shrink: true },
        input: {
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : null,
        },
      }}
      {...validate}
    />
  );
};

// Date picker component using MUI TextField type="date"
const SimpleDatePicker = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  disabled = false, 
  required = false,
  errors,
  helperText = '',
}) => {
  const error = get(errors, name);
  
  return (
    <TextField
      fullWidth
      id={id}
      name={name}
      label={label}
      type="date"
      required={required}
      disabled={disabled}
      value={value ? formatDate(value) : ''}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
      error={!!error}
      helperText={error?.message || helperText}
      slotProps={{
        inputLabel: { shrink: true },
      }}
      sx={!value ? {
        '& input[type="date"]::-webkit-datetime-edit': {
          color: 'transparent',
        },
      } : {}}
    />
  );
};

// Toggle days component for meal delivery days
const ToggleDays = ({ field, disabled = false }) => {
  const handleDayChange = (dayIndex) => {
    if (disabled) return;
    const newDays = { ...field.value };
    newDays[dayIndex] = newDays[dayIndex] ? 0 : 1;
    field.onChange(newDays);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
      {DAY_LABELS.map((day, index) => (
        <Button
          key={day}
          variant={field.value?.[index] ? 'contained' : 'outlined'}
          size="small"
          disabled={disabled}
          onClick={() => handleDayChange(index)}
          sx={{
            minWidth: 48,
            height: 36,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: field.value?.[index] ? '#5E6AD2' : 'transparent',
            borderColor: field.value?.[index] ? '#5E6AD2' : 'rgba(255,255,255,0.10)',
            color: field.value?.[index] ? 'white' : '#8A8F98',
            boxShadow: field.value?.[index] ? '0 0 12px rgba(94,106,210,0.3)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              backgroundColor: field.value?.[index] ? '#6872D9' : 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(94,106,210,0.4)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {day}
        </Button>
      ))}
    </Box>
  );
};

// Phone input component (simplified)
const PhoneInput = ({ value, onChange, errors }) => {
  const [countryCode, setCountryCode] = useState('+1');
  const [number, setNumber] = useState('');

  useEffect(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        setCountryCode(parts[0]);
        setNumber(parts.slice(1).join(' '));
      }
    }
  }, []);

  const handleChange = (code, num) => {
    onChange(`${code} ${num}`);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
      <Select
        size="small"
        value={countryCode}
        onChange={(e) => {
          setCountryCode(e.target.value);
          handleChange(e.target.value, number);
        }}
        sx={{ width: 100 }}
      >
        <MenuItem value="+1">+1</MenuItem>
        <MenuItem value="+91">+91</MenuItem>
        <MenuItem value="+44">+44</MenuItem>
      </Select>
      <TextField
        fullWidth
        type="tel"
        label="Phone Number"
        value={number}
        onChange={(e) => {
          setNumber(e.target.value);
          handleChange(countryCode, e.target.value);
        }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />
      </div>

    </Box>
  );
};


export {
getAggregatedDeliveryDays,
calculateTotalDeliveries,
calculateEndDate,
addDays,
formatDate,
capitalizeFirstLetter,
BaseTextField,
SimpleDatePicker,
ToggleDays,
PhoneInput,

};