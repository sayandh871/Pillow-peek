"use server";

export async function submitContactForm(formData: {
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
}) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Contact Form Submission:", formData);

  return { success: true };
}
