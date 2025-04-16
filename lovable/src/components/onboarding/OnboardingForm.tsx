
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';

// Form schema
const onboardingSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  experience: z.string().min(1, { message: 'Please select your experience level' }),
  position: z.string().min(1, { message: 'Please select your preferred position' }),
  boatTypes: z.array(z.string()).min(1, { message: 'Please select at least one boat type' }),
  crewSizes: z.array(z.string()).min(1, { message: 'Please select at least one crew size' }),
  availability: z.array(z.string()).min(1, { message: 'Please select at least one availability' }),
  additionalInfo: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const boatTypes = [
  { id: 'scull', label: 'Scull' },
  { id: 'sweep', label: 'Sweep' },
  { id: 'both', label: 'Both' },
];

const crewSizes = [
  { id: 'single', label: 'Single (1x)' },
  { id: 'double', label: 'Double (2x)' },
  { id: 'pair', label: 'Pair (2-)' },
  { id: 'four', label: 'Four (4+/4-)' },
  { id: 'quad', label: 'Quad (4x)' },
  { id: 'eight', label: 'Eight (8+)' },
];

const OnboardingForm: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Initialize form
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      experience: '',
      position: '',
      boatTypes: [],
      crewSizes: [],
      availability: [],
      additionalInfo: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: OnboardingFormValues) => {
    setLoading(true);
    try {
      // Update user profile with form data
      updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        experience: data.experience,
        availability: data.availability,
        preferences: {
          position: data.position,
          boatType: data.boatTypes,
          crewSize: data.crewSizes,
        },
        onboardingCompleted: true,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const nextStep = () => {
    let canProceed = false;
    
    if (step === 1) {
      // Validate first step fields
      const firstStepValid = form.trigger(['firstName', 'lastName', 'experience']);
      firstStepValid.then(valid => {
        if (valid) setStep(step + 1);
      });
    } else if (step === 2) {
      // Validate second step fields
      const secondStepValid = form.trigger(['position', 'boatTypes', 'crewSizes']);
      secondStepValid.then(valid => {
        if (valid) setStep(step + 1);
      });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <React.Fragment>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        className="form-input-transition input-focus-ring"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        className="form-input-transition input-focus-ring"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input-transition input-focus-ring">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How long have you been rowing?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </React.Fragment>
        );
      
      case 2:
        return (
          <React.Fragment>
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Position</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input-transition input-focus-ring">
                        <SelectValue placeholder="Select your preferred position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bow">Bow</SelectItem>
                      <SelectItem value="stern">Stern</SelectItem>
                      <SelectItem value="port">Port</SelectItem>
                      <SelectItem value="starboard">Starboard</SelectItem>
                      <SelectItem value="cox">Coxswain</SelectItem>
                      <SelectItem value="any">Any position</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="boatTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Preferred Boat Types</FormLabel>
                    <FormDescription>
                      Select all that apply
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {boatTypes.map((type) => (
                      <FormField
                        key={type.id}
                        control={form.control}
                        name="boatTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={type.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, type.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== type.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crewSizes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Preferred Crew Sizes</FormLabel>
                    <FormDescription>
                      Select all that apply
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {crewSizes.map((size) => (
                      <FormField
                        key={size.id}
                        control={form.control}
                        name="crewSizes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={size.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(size.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, size.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== size.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {size.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </React.Fragment>
        );
      
      case 3:
        return (
          <React.Fragment>
            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Availability</FormLabel>
                    <FormDescription>
                      Which days are you typically available?
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="availability"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us anything else that might be relevant (optional)"
                      className="form-input-transition input-focus-ring resize-none h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Any health concerns, special requirements, or achievements you'd like to share?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </React.Fragment>
        );
      
      default:
        return null;
    }
  };

  // Render progress indicator
  const renderProgress = () => {
    return (
      <div className="flex justify-between mb-8">
        {[...Array(totalSteps)].map((_, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center ${index < step ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 text-white ${
                index + 1 === step 
                  ? 'bg-primary'
                  : index < step 
                  ? 'bg-primary/80'
                  : 'bg-muted'
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs hidden md:block">
              {index === 0 ? 'Personal Info' : index === 1 ? 'Rowing Preferences' : 'Availability'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Complete Your Profile</CardTitle>
        <CardDescription>
          Help us match you with the perfect crew by providing some information about yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderProgress()}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        {step < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OnboardingForm;
