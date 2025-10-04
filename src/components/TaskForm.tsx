"use client";

import {useState, FormEvent} from "react";
import {TextField, Box, Button, CircularProgress} from "@mui/material";
import {CreateTaskInput, UpdateTaskInput} from "@/types/task";

interface TaskFormProps {
  initialValues?: {
    title: string;
    description: string;
  };
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export default function TaskForm({
  initialValues = {title: "", description: ""},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "ذخیره",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({title: false, description: false});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = "عنوان الزامی است";
    } else if (title.length > 200) {
      newErrors.title = "عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد";
    }

    // Validate description
    if (description.length > 1000) {
      newErrors.description = "توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({title: true, description: true});

    if (validateForm()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
      });
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (touched.title) {
      // Re-validate on change if field was touched
      const newErrors: FormErrors = {...errors};
      if (!value.trim()) {
        newErrors.title = "عنوان الزامی است";
      } else if (value.length > 200) {
        newErrors.title = "عنوان نباید بیشتر از ۲۰۰ کاراکتر باشد";
      } else {
        delete newErrors.title;
      }
      setErrors(newErrors);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (touched.description) {
      // Re-validate on change if field was touched
      const newErrors: FormErrors = {...errors};
      if (value.length > 1000) {
        newErrors.description = "توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد";
      } else {
        delete newErrors.description;
      }
      setErrors(newErrors);
    }
  };

  const handleTitleBlur = () => {
    setTouched((prev) => ({...prev, title: true}));
    validateForm();
  };

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({...prev, description: true}));
    validateForm();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        fullWidth
        required
        label="عنوان"
        placeholder="عنوان تسک را وارد کنید"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        onBlur={handleTitleBlur}
        error={touched.title && !!errors.title}
        helperText={touched.title && errors.title}
        disabled={isLoading}
        margin="normal"
        autoFocus
        inputProps={{
          maxLength: 201, // Allow typing one extra to show error
        }}
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        label="توضیحات"
        placeholder="توضیحات تسک را وارد کنید (اختیاری)"
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        onBlur={handleDescriptionBlur}
        error={touched.description && !!errors.description}
        helperText={touched.description && errors.description}
        disabled={isLoading}
        margin="normal"
        inputProps={{
          maxLength: 1001, // Allow typing one extra to show error
        }}
      />

      <Box sx={{display: "flex", gap: 2, justifyContent: "flex-end", mt: 3}}>
        <Button onClick={onCancel} disabled={isLoading} color="inherit">
          انصراف
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
