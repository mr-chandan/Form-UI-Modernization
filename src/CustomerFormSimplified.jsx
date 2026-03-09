import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Tabs,
  Tab,
  Switch,
} from "@mui/material";
import {
  useForm,
  Controller,
  useFieldArray,
  FormProvider,
} from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  getAggregatedDeliveryDays,
  calculateTotalDeliveries,
  calculateEndDate,
  capitalizeFirstLetter,
  BaseTextField,
  SimpleDatePicker,
  ToggleDays,
  PhoneInput,
} from "./lib/utils";
import {
  MOCK_MEAL_PLANS,
  PAYMENT_MODE,
  PAYMENT_STATUS,
  SUBSCRIPTION,
  DELIVERY_METHOD,
  MOCK_SETTINGS,
} from "./lib/mockdata";
import ErrorIcon from "@mui/icons-material/Error";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CustomerFormSimplified() {
  // Form setup with react-hook-form
  const methods = useForm({
    defaultValues: {
      customer: {
        firstName: "",
        lastName: "",
        phoneNumber: { number: "", countryCode: "+1", completeNumber: "" },
        email: "",
        address: { description: "" },
        unit: "",
        dateOfBirth: null,
      },
      mealPlans: [
        {
          id: null,
          name: "",
          items: [],
          days: MOCK_SETTINGS.deliveryDays,
        },
      ],
      plan: {
        category: SUBSCRIPTION.TYPE.SCHEDULED.LABEL,
        type: SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.WEEKLY,
        count: 4,
        totalDeliveries: 0,
      },
      customPlanType: SUBSCRIPTION.TYPE.SCHEDULED.CUSTOM_OPTIONS.BY_END_DATE,
      startDate: new Date(),
      endDate: null,
      isTrial: false,
      shipping: DELIVERY_METHOD.HOME_DELIVERY,
      route: null,
      deliveryInstructions: "",
      payment: {
        status: PAYMENT_STATUS.UNPAID,
        amount: 0,
        paidAmount: 0,
        mode: PAYMENT_MODE.CASH,
        date: null,
        referenceId: "",
        taxPercent: 0,
        totalAmount: 0,
      },
      packingInstructions: "",
      adminNotes: "",
    },
    mode: "onChange",
  });

  const {
    register,
    control,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors },
    handleSubmit,
  } = methods;

  // Field array for meal plans
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mealPlans",
  });

  // State
  const [systemCalculatedPrice, setSystemCalculatedPrice] = useState(0);
  const [viewMode, setViewMode] = useState("classic");
  const [activeTab, setActiveTab] = useState(0);

  // Watch values for reactive updates
  const mealPlans = watch("mealPlans");
  const planType = watch("plan.type");
  const planCategory = watch("plan.category");
  const planCount = watch("plan.count");
  const startDate = watch("startDate");
  const customPlanType = watch("customPlanType");
  const planAmount = watch("payment.amount");
  const planTaxPercent = watch("payment.taxPercent");

  // Aggregate delivery days from all meal plans
  const aggregatedDeliveryDays = useMemo(() => {
    return getAggregatedDeliveryDays(mealPlans);
  }, [JSON.stringify(mealPlans?.map((mp) => mp?.days))]);

  // ============================================================================
  // EFFECTS - These should remain functional after the UI transformation
  // ============================================================================

  // Effect: Calculate end date based on plan type and count
  useEffect(() => {
    if (planCategory !== SUBSCRIPTION.TYPE.SCHEDULED.LABEL) return;
    if (planType === SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM) return;
    if (planType === SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.SINGLE) {
      // Single delivery - end date same as start date
      if (startDate) {
        setValue("endDate", startDate);
        setValue("plan.totalDeliveries", 1);
      }
      return;
    }

    const endDate = calculateEndDate(
      startDate,
      planType,
      planCount,
      aggregatedDeliveryDays,
    );
    if (endDate) {
      setValue("endDate", endDate);

      // Calculate total deliveries
      const totalDeliveries = calculateTotalDeliveries(
        startDate,
        endDate,
        aggregatedDeliveryDays,
      );
      setValue("plan.totalDeliveries", totalDeliveries);
    }
  }, [
    planCategory,
    planType,
    startDate,
    planCount,
    aggregatedDeliveryDays,
    setValue,
  ]);

  // Effect: Calculate system price based on meal plans and deliveries
  useEffect(() => {
    const totalDeliveries = getValues("plan.totalDeliveries");
    if (!mealPlans || !totalDeliveries) {
      setSystemCalculatedPrice(0);
      return;
    }

    let totalPrice = 0;
    mealPlans.forEach((plan) => {
      if (plan?.id) {
        const mealPlanData = MOCK_MEAL_PLANS.find((mp) => mp.id === plan.id);
        if (mealPlanData) {
          // Calculate deliveries per week for this plan
          const daysPerWeek = Object.values(plan.days || {}).reduce(
            (sum, val) => sum + val,
            0,
          );
          const pricePerDelivery = mealPlanData.price;
          totalPrice += pricePerDelivery * totalDeliveries;
        }
      }
    });

    setSystemCalculatedPrice(totalPrice);
  }, [mealPlans, watch("plan.totalDeliveries")]);

  // Effect: Calculate total amount with tax
  useEffect(() => {
    if (planAmount && planTaxPercent >= 0) {
      const taxAmount = (planAmount * planTaxPercent) / 100;
      const totalAmount = parseFloat(planAmount) + taxAmount;
      setValue("payment.totalAmount", totalAmount);
    }
  }, [planAmount, planTaxPercent, setValue]);

  // Form submission handler
  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    alert("Form submitted successfully! Check console for data.");
  };

  const fieldToTab = {
    customer: 0,
    mealPlans: 1,
    plan: 2,
    startDate: 2,
    endDate: 2,
    customPlanType: 2,
    payment: 3,
    packingInstructions: 4,
    adminNotes: 4,
  };

  const handleFormSubmit = async () => {
    // Trigger validation on ALL fields first
    const isValid = await trigger();

    if (isValid) {
      const data = methods.getValues();
      console.log("Form submitted:", data);
      alert("Form submitted successfully! Check console for data.");
    } else {
      // Read errors after trigger completes
      const currentErrors = methods.formState.errors;
      console.log(
        "Form errors:",
        currentErrors,
        "Keys:",
        Object.keys(currentErrors),
      );

      // In modern view, switch to the first tab that has an error
      if (viewMode === "modern") {
        for (const key of Object.keys(currentErrors)) {
          if (fieldToTab[key] !== undefined) {
            console.log(
              "Switching to tab:",
              fieldToTab[key],
              "for error key:",
              key,
            );
            setActiveTab(fieldToTab[key]);
            return;
          }
        }
      }

      // In classic view, scroll to the first field with an error
      if (viewMode === "classic") {
        setTimeout(() => {
          const firstError = document.querySelector(
            ".Mui-error, [aria-invalid='true']",
          );
          if (firstError) {
            firstError.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  };

  // Map field error paths to tab indices
  const getTabsWithErrors = () => {
    const tabErrors = [false, false, false, false, false];
    if (!errors || Object.keys(errors).length === 0) return tabErrors;

    // Tab 0: Personal Details — errors under "customer"
    if (errors.customer) tabErrors[0] = true;

    // Tab 1: Meal Plan Details — errors under "mealPlans"
    if (errors.mealPlans) tabErrors[1] = true;

    // Tab 2: Subscription Details — errors under "plan", "startDate", "endDate", "customPlanType"
    if (
      errors.plan ||
      errors.startDate ||
      errors.endDate ||
      errors.customPlanType
    )
      tabErrors[2] = true;

    // Tab 3: Payment Details — errors under "payment"
    if (errors.payment) tabErrors[3] = true;

    // Tab 4: Instructions — errors under "packingInstructions", "adminNotes"
    if (errors.packingInstructions || errors.adminNotes) tabErrors[4] = true;

    return tabErrors;
  };

  const tabsWithErrors = getTabsWithErrors();

  const TAB_LABELS = [
    "Personal Details",
    "Meal Plan Details",
    "Subscription Details",
    "Payment Details",
    "Instructions",
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <FormProvider {...methods}>
      <Box
        component="div"
        sx={{
          maxWidth: 960,
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          pb: 14,
          position: "relative",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              color: "#5E6AD2",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              fontWeight: 500,
              mb: 1,
              display: "block",
            }}
          >
            SUBSCRIPTIONS / NEW
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              background:
                "linear-gradient(to bottom, #EDEDEF, rgba(237,237,239,0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.75rem", sm: "2.25rem" },
              lineHeight: 1.1,
            }}
          >
            New Subscription
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "#8A8F98", fontSize: "0.875rem" }}
          >
            Fill in the details below to create a new meal subscription
          </Typography>
        </Box>

        {/* View Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            gap: 1,
            p: 0.5,
            px: 1.5,
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.06)",
            width: "fit-content",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: viewMode === "classic" ? 600 : 400,
              color: viewMode === "classic" ? "#EDEDEF" : "#8A8F98",
              fontSize: "0.8125rem",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            Classic
          </Typography>
          <Switch
            checked={viewMode === "modern"}
            onChange={(e) =>
              setViewMode(e.target.checked ? "modern" : "classic")
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#5E6AD2" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#5E6AD2",
              },
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255,255,255,0.15)",
              },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: viewMode === "modern" ? 600 : 400,
              color: viewMode === "modern" ? "#EDEDEF" : "#8A8F98",
              fontSize: "0.8125rem",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            Modern
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {viewMode === "modern" && (
            <Grid item xs={12}>
              <Tabs
                value={activeTab}
                onChange={(e, newVal) => setActiveTab(newVal)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 1,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.06)",
                  p: 0.5,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: 1.5,
                    minHeight: 40,
                    fontSize: "0.8125rem",
                    color: "#8A8F98",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "#EDEDEF",
                    },
                  },
                  "& .Mui-selected": {
                    color: "#EDEDEF !important",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    fontWeight: 600,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#5E6AD2",
                    borderRadius: 2,
                    height: 2,
                    boxShadow: "0 0 8px rgba(94,106,210,0.4)",
                  },
                  "& .MuiTabs-scrollButtons": { color: "#8A8F98" },
                }}
              >
                {TAB_LABELS.map((label, index) => (
                  <Tab
                    key={label}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {label}
                        {tabsWithErrors[index] && (
                          <ErrorIcon
                            sx={{ color: "error.main", fontSize: 16 }}
                          />
                        )}
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Grid>
          )}

          {/* ================================================================ */}
          {/* SECTION 1: Personal Details */}
          {/* ================================================================ */}
          <Grid
            item
            xs={12}
            sx={{
              display:
                viewMode === "classic" || activeTab === 0 ? "block" : "none",
            }}
          >
            <Grid item xs={12}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(94,106,210,0.05)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2.5,
                    color: "#EDEDEF",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      borderRadius: 1,
                      background:
                        "linear-gradient(to bottom, #5E6AD2, #5E6AD2aa)",
                    }}
                  />
                  Personal Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="customer.firstName"
                      control={control}
                      rules={{
                        required: "First name is required",
                        maxLength: {
                          value: 500,
                          message: "Max 500 characters",
                        },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="firstName"
                          name="customer.firstName"
                          label="First Name"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              capitalizeFirstLetter(e.target.value),
                            )
                          }
                          errors={errors}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="customer.lastName"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 500,
                          message: "Max 500 characters",
                        },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="lastName"
                          name="customer.lastName"
                          label="Last Name"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              capitalizeFirstLetter(e.target.value),
                            )
                          }
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="customer.phoneNumber.completeNumber"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="customer.email"
                      control={control}
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "Invalid email format",
                        },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="email"
                          name="customer.email"
                          label="Email"
                          type="email"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Controller
                      name="customer.unit"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 500,
                          message: "Max 500 characters",
                        },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="unit"
                          name="customer.unit"
                          label="Unit"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={9}>
                    <Controller
                      name="customer.address.description"
                      control={control}
                      rules={{
                        required: "Address is required",
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="address"
                          name="customer.address.description"
                          label="Address"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required
                          helperText="Enter full street address"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Controller
                      name="customer.dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <SimpleDatePicker
                          id="dateOfBirth"
                          name="customer.dateOfBirth"
                          label="Date of Birth"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* ================================================================ */}
          {/* SECTION 2: Meal Plan Details */}
          {/* ================================================================ */}

          <Grid
            item
            xs={12}
            sx={{
              display:
                viewMode === "classic" || activeTab === 1 ? "block" : "none",
            }}
          >
            <Grid item xs={12}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(94,106,210,0.05)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2.5,
                    color: "#EDEDEF",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      borderRadius: 1,
                      background:
                        "linear-gradient(to bottom, #5E6AD2, #5E6AD2aa)",
                    }}
                  />
                  Meal Plan Details
                </Typography>

                {fields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2.5,
                      mb: 2,
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 3,
                      position: "relative",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      "&:hover": {
                        borderColor: "rgba(94,106,210,0.3)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      },
                    }}
                  >
                    {fields.length > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={500}
                          color="primary"
                        >
                          Meal Plan {index + 1}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => remove(index)}
                          startIcon={<DeleteIcon />}
                        >
                          Remove
                        </Button>
                      </Box>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Controller
                          name={`mealPlans.${index}`}
                          control={control}
                          rules={{
                            validate: (value) =>
                              value?.id ? true : "Meal plan is required",
                          }}
                          render={({ field: controllerField }) => (
                            <FormControl fullWidth>
                              <InputLabel>Select Meal Plan *</InputLabel>
                              <Select
                                label="Select Meal Plan *"
                                value={controllerField.value?.id || ""}
                                onChange={(e) => {
                                  const selectedPlan = MOCK_MEAL_PLANS.find(
                                    (mp) => mp.id === e.target.value,
                                  );
                                  if (selectedPlan) {
                                    controllerField.onChange({
                                      id: selectedPlan.id,
                                      name: selectedPlan.name,
                                      items: selectedPlan.items,
                                      days: selectedPlan.days,
                                    });
                                  }
                                }}
                                error={!!errors?.mealPlans?.[index]?.message}
                              >
                                {MOCK_MEAL_PLANS.map((plan) => (
                                  <MenuItem key={plan.id} value={plan.id}>
                                    {plan.name} - ${plan.price}/delivery
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors?.mealPlans?.[index] && (
                                <FormHelperText error>
                                  {errors.mealPlans[index].message}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>

                      {planCategory !== SUBSCRIPTION.TYPE.ON_DEMAND.LABEL && (
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              border: "1px solid rgba(255,255,255,0.06)",
                              borderRadius: 2.5,
                              p: 2,
                              backgroundColor: "rgba(255,255,255,0.02)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                mb: 1.5,
                                display: "block",
                                fontWeight: 500,
                                letterSpacing: "0.05em",
                                color: "#8A8F98",
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                              }}
                            >
                              Meals/Day *
                            </Typography>
                            <Controller
                              name={`mealPlans.${index}.days`}
                              control={control}
                              rules={{
                                validate: (value) => {
                                  const total = Object.values(
                                    value || {},
                                  ).reduce((sum, v) => sum + v, 0);
                                  return (
                                    total > 0 ||
                                    "Select at least one delivery day"
                                  );
                                },
                              }}
                              render={({ field }) => (
                                <ToggleDays field={field} disabled={false} />
                              )}
                            />
                            {errors?.mealPlans?.[index]?.days && (
                              <FormHelperText error>
                                {errors.mealPlans[index].days.message}
                              </FormHelperText>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      append({
                        id: null,
                        name: "",
                        items: [],
                        days: MOCK_SETTINGS.deliveryDays,
                      })
                    }
                    sx={{
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "#8A8F98",
                      borderStyle: "dashed",
                      py: 1,
                      px: 3,
                      "&:hover": {
                        borderColor: "rgba(94,106,210,0.4)",
                        borderStyle: "dashed",
                        backgroundColor: "rgba(94,106,210,0.06)",
                        color: "#EDEDEF",
                      },
                    }}
                  >
                    Add Meal Plan
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* ================================================================ */}
          {/* SECTION 3: Subscription Details */}
          {/* ================================================================ */}
          <Grid
            item
            xs={12}
            sx={{
              display:
                viewMode === "classic" || activeTab === 2 ? "block" : "none",
            }}
          >
            <Grid item xs={12}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(94,106,210,0.05)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2.5,
                    color: "#EDEDEF",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      borderRadius: 1,
                      background:
                        "linear-gradient(to bottom, #5E6AD2, #5E6AD2aa)",
                    }}
                  />
                  Subscription Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="plan.category"
                      control={control}
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Subscription Category *</InputLabel>
                          <Select
                            label="Subscription Category *"
                            value={field.value}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              // Reset type when category changes
                              if (
                                e.target.value ===
                                SUBSCRIPTION.TYPE.SCHEDULED.LABEL
                              ) {
                                setValue(
                                  "plan.type",
                                  SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.WEEKLY,
                                );
                              } else {
                                setValue(
                                  "plan.type",
                                  SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS
                                    .WITHOUT_END_DATE,
                                );
                              }
                            }}
                          >
                            <MenuItem value={SUBSCRIPTION.TYPE.SCHEDULED.LABEL}>
                              Scheduled
                            </MenuItem>
                            <MenuItem value={SUBSCRIPTION.TYPE.ON_DEMAND.LABEL}>
                              On Demand
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="plan.type"
                      control={control}
                      rules={{ required: "Plan type is required" }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Plan Type *</InputLabel>
                          <Select
                            label="Plan Type *"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            {planCategory ===
                            SUBSCRIPTION.TYPE.SCHEDULED.LABEL ? (
                              Object.values(
                                SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS,
                              ).map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))
                            ) : (
                              <>
                                <MenuItem
                                  value={
                                    SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS
                                      .WITH_END_DATE
                                  }
                                >
                                  With End Date
                                </MenuItem>
                                <MenuItem
                                  value={
                                    SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS
                                      .WITHOUT_END_DATE
                                  }
                                >
                                  Without End Date
                                </MenuItem>
                              </>
                            )}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {planType !== SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM &&
                    planType !== SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.SINGLE &&
                    planCategory !== SUBSCRIPTION.TYPE.ON_DEMAND.LABEL && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Controller
                          name="plan.count"
                          control={control}
                          rules={{
                            required: "Count is required",
                            min: { value: 1, message: "Must be at least 1" },
                          }}
                          render={({ field }) => (
                            <BaseTextField
                              id="planCount"
                              name="plan.count"
                              label={`Total ${planType === SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.WEEKLY ? "Weeks" : planType === SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.BIWEEKLY ? "Bi-Weeks" : "Months"}`}
                              type="number"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                              errors={errors}
                            />
                          )}
                        />
                      </Grid>
                    )}

                  {planType === SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM &&
                    planCategory === SUBSCRIPTION.TYPE.SCHEDULED.LABEL && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Controller
                          name="customPlanType"
                          control={control}
                          render={({ field }) => (
                            <ToggleButtonGroup
                              fullWidth
                              size="small"
                              value={field.value}
                              exclusive
                              onChange={(e, val) => val && field.onChange(val)}
                            >
                              {Object.values(
                                SUBSCRIPTION.TYPE.SCHEDULED.CUSTOM_OPTIONS,
                              ).map((option) => (
                                <ToggleButton
                                  key={option}
                                  value={option}
                                  sx={{
                                    color: "#8A8F98",
                                    borderColor: "rgba(255,255,255,0.10)",
                                    fontSize: "0.75rem",
                                    "&.Mui-selected": {
                                      backgroundColor: "#5E6AD2",
                                      color: "white",
                                      boxShadow:
                                        "0 0 12px rgba(94,106,210,0.3)",
                                      "&:hover": { backgroundColor: "#6872D9" },
                                    },
                                    "&:hover": {
                                      backgroundColor: "rgba(255,255,255,0.05)",
                                    },
                                  }}
                                >
                                  {option}
                                </ToggleButton>
                              ))}
                            </ToggleButtonGroup>
                          )}
                        />
                      </Grid>
                    )}

                  {planCategory === SUBSCRIPTION.TYPE.SCHEDULED.LABEL && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name="isTrial"
                        control={control}
                        render={({ field }) => (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={field.value || false}
                                  onChange={field.onChange}
                                  sx={{
                                    color: "#5E6AD2",
                                    "&.Mui-checked": { color: "#5E6AD2" },
                                  }}
                                />
                              }
                              label="Mark as Trial"
                            />
                            {field.value && (
                              <Tooltip title="Trial subscriptions won't auto-renew">
                                <WarningAmberIcon
                                  sx={{ color: "warning.main", fontSize: 20 }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="startDate"
                      control={control}
                      rules={{ required: "Start date is required" }}
                      render={({ field }) => (
                        <SimpleDatePicker
                          id="startDate"
                          name="startDate"
                          label="Start Date"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="endDate"
                      control={control}
                      rules={{
                        required:
                          planType ===
                            SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM ||
                          planType ===
                            SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS.WITH_END_DATE
                            ? "End date is required"
                            : false,
                      }}
                      render={({ field }) => (
                        <SimpleDatePicker
                          id="endDate"
                          name="endDate"
                          label="End Date"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={
                            customPlanType ===
                              SUBSCRIPTION.TYPE.SCHEDULED.CUSTOM_OPTIONS
                                .BY_DELIVERIES ||
                            (planType !==
                              SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM &&
                              planType !==
                                SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS
                                  .WITH_END_DATE)
                          }
                          errors={errors}
                          required={
                            planType ===
                              SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM ||
                            planType ===
                              SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS.WITH_END_DATE
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="plan.totalDeliveries"
                      control={control}
                      rules={{
                        required: "Total deliveries is required",
                        min: { value: 0, message: "Must be 0 or more" },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="totalDeliveries"
                          name="plan.totalDeliveries"
                          label="Total Deliveries"
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={
                            customPlanType ===
                              SUBSCRIPTION.TYPE.SCHEDULED.CUSTOM_OPTIONS
                                .BY_END_DATE ||
                            (planType !==
                              SUBSCRIPTION.TYPE.SCHEDULED.OPTIONS.CUSTOM &&
                              planType !==
                                SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS
                                  .WITHOUT_END_DATE &&
                              planType !==
                                SUBSCRIPTION.TYPE.ON_DEMAND.OPTIONS
                                  .WITH_END_DATE)
                          }
                          errors={errors}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* ================================================================ */}
          {/* SECTION 4: Payment Details */}
          {/* ================================================================ */}
          <Grid
            item
            xs={12}
            sx={{
              display:
                viewMode === "classic" || activeTab === 3 ? "block" : "none",
            }}
          >
            <Grid item xs={12}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(94,106,210,0.05)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2.5,
                    color: "#EDEDEF",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      borderRadius: 1,
                      background:
                        "linear-gradient(to bottom, #5E6AD2, #5E6AD2aa)",
                    }}
                  />
                  Payment Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="payment.status"
                      control={control}
                      rules={{ required: "Payment status is required" }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Payment Status *</InputLabel>
                          <Select
                            label="Payment Status *"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <MenuItem value={PAYMENT_STATUS.PAID}>
                              Paid
                            </MenuItem>
                            <MenuItem value={PAYMENT_STATUS.UNPAID}>
                              Unpaid
                            </MenuItem>
                            <MenuItem value={PAYMENT_STATUS.PARTIALLY_PAID}>
                              Partially Paid
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="payment.amount"
                      control={control}
                      rules={{
                        required: "Amount is required",
                        pattern: {
                          value: /^[0-9]*\.?[0-9]+$/,
                          message: "Must be a number",
                        },
                      }}
                      render={({ field }) => (
                        <Box>
                          <BaseTextField
                            id="paymentAmount"
                            name="payment.amount"
                            label="Amount"
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            startAdornment={MOCK_SETTINGS.currency}
                            errors={errors}
                            helperText={
                              systemCalculatedPrice > 0 &&
                              field.value != systemCalculatedPrice
                                ? `Suggested: ${MOCK_SETTINGS.currency}${systemCalculatedPrice.toFixed(2)}`
                                : ""
                            }
                          />
                          {systemCalculatedPrice > 0 &&
                            field.value != systemCalculatedPrice && (
                              <Button
                                size="small"
                                onClick={() =>
                                  field.onChange(systemCalculatedPrice)
                                }
                                sx={{
                                  mt: 0.5,
                                  color: "#5E6AD2",
                                  textTransform: "none",
                                }}
                              >
                                Apply suggested price
                              </Button>
                            )}
                        </Box>
                      )}
                    />
                  </Grid>

                  {watch("payment.status") ===
                    PAYMENT_STATUS.PARTIALLY_PAID && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name="payment.paidAmount"
                        control={control}
                        rules={{
                          required: "Paid amount is required",
                          max: {
                            value: planAmount,
                            message: "Cannot exceed total amount",
                          },
                        }}
                        render={({ field }) => (
                          <BaseTextField
                            id="paidAmount"
                            name="payment.paidAmount"
                            label="Paid Amount"
                            type="number"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            startAdornment={MOCK_SETTINGS.currency}
                            errors={errors}
                            helperText={
                              field.value
                                ? `Remaining: ${MOCK_SETTINGS.currency}${(planAmount - field.value).toFixed(2)}`
                                : ""
                            }
                          />
                        )}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="payment.date"
                      control={control}
                      render={({ field }) => (
                        <SimpleDatePicker
                          id="paymentDate"
                          name="payment.date"
                          label={
                            watch("payment.status") === PAYMENT_STATUS.PAID
                              ? "Payment Date"
                              : "Expected Payment Date"
                          }
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={
                            watch("payment.status") === PAYMENT_STATUS.PAID
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Controller
                      name="payment.mode"
                      control={control}
                      rules={{ required: "Payment mode is required" }}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Payment Mode *</InputLabel>
                          <Select
                            label="Payment Mode *"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            {Object.values(PAYMENT_MODE).map((mode) => (
                              <MenuItem key={mode} value={mode}>
                                {mode}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <Controller
                      name="payment.referenceId"
                      control={control}
                      render={({ field }) => (
                        <BaseTextField
                          id="referenceId"
                          name="payment.referenceId"
                          label="Reference ID"
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* ================================================================ */}
          {/* SECTION 5: Instructions */}
          {/* ================================================================ */}
          <Grid
            item
            xs={12}
            sx={{
              display:
                viewMode === "classic" || activeTab === 4 ? "block" : "none",
            }}
          >
            <Grid item xs={12} mb={8}>
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(94,106,210,0.05)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2.5,
                    color: "#EDEDEF",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      height: 20,
                      borderRadius: 1,
                      background:
                        "linear-gradient(to bottom, #5E6AD2, #5E6AD2aa)",
                    }}
                  />
                  Instructions
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="packingInstructions"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 5000,
                          message: "Max 5000 characters",
                        },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="packingInstructions"
                          name="packingInstructions"
                          label="Packing Team Instructions"
                          multiline
                          rows={5}
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="adminNotes"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 5000,
                          message: "Max 5000 characters",
                        },
                      }}
                      render={({ field }) => (
                        <BaseTextField
                          id="adminNotes"
                          name="adminNotes"
                          label="Notes"
                          multiline
                          rows={5}
                          value={field.value}
                          onChange={field.onChange}
                          errors={errors}
                          required={false}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {viewMode === "modern" && (
            <Grid item xs={12}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<NavigateBeforeIcon />}
                  disabled={activeTab === 0}
                  onClick={() => setActiveTab((prev) => prev - 1)}
                  sx={{
                    borderColor: "rgba(255,255,255,0.10)",
                    color: "#EDEDEF",
                    px: 3,
                    py: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&.Mui-disabled": {
                      borderColor: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  endIcon={<NavigateNextIcon />}
                  disabled={activeTab === 4}
                  onClick={() => setActiveTab((prev) => prev + 1)}
                  sx={{
                    backgroundColor: "#5E6AD2",
                    px: 3,
                    py: 1,
                    "&:hover": { backgroundColor: "#6872D9" },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Submit Button */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            py: 1.5,
            px: 3,
            backgroundColor: "rgba(5,5,6,0.85)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "center",
            gap: 2,
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={() => methods.reset()}
            sx={{
              minWidth: 160,
              py: 1.2,
              borderColor: "rgba(255,255,255,0.10)",
              color: "#8A8F98",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.15)",
                color: "#EDEDEF",
                backgroundColor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="contained"
            size="large"
            onClick={handleFormSubmit}
            sx={{
              minWidth: 200,
              py: 1.2,
              backgroundColor: "#5E6AD2",
              fontSize: "0.875rem",
              "&:hover": { backgroundColor: "#6872D9" },
            }}
          >
            Save Subscription
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
}
