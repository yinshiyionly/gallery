import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Checkbox,
  Divider,
  Input,
  Loading,
  Modal,
  RadioGroup,
  Select,
  Skeleton,
  Switch,
  Textarea,
  Tooltip,
} from './index';

const UIComponentsDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [switchValue, setSwitchValue] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">UI Components Demo</h1>

      <section>
        <h2 className="text-xl font-semibold mb-3">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button isLoading>Loading</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </section>

      <Divider />

      <section>
        <h2 className="text-xl font-semibold mb-3">Alerts</h2>
        <div className="space-y-3">
          <Alert>This is a default alert</Alert>
          <Alert variant="info" title="Information">
            This is an informational alert with a title
          </Alert>
          <Alert variant="success" title="Success">
            Your changes have been saved successfully
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review your information before continuing
          </Alert>
          <Alert variant="error" title="Error" dismissible onDismiss={() => console.log('Alert dismissed')}>
            There was an error processing your request
          </Alert>
        </div>
      </section>

      <Divider />

      <section>
        <h2 className="text-xl font-semibold mb-3">Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Username" placeholder="Enter your username" />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter your password" 
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="Enter your email" 
              error="Please enter a valid email address" 
            />
            <Textarea 
              label="Message" 
              placeholder="Enter your message" 
              rows={4} 
            />
            <Select 
              label="Country" 
              options={[
                { value: '', label: 'Select a country', disabled: true },
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'mx', label: 'Mexico' },
                { value: 'uk', label: 'United Kingdom' },
              ]} 
              defaultValue=""
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Checkbox label="Accept terms and conditions" description="I agree to the terms of service and privacy policy" />
              <Checkbox label="Subscribe to newsletter" defaultChecked />
              <Checkbox label="Disabled option" disabled />
            </div>
            
            <div className="mt-4">
              <RadioGroup 
                label="Notification preferences"
                name="notifications"
                value={radioValue}
                onChange={setRadioValue}
                options={[
                  { value: 'option1', label: 'All notifications', description: 'Receive all notifications' },
                  { value: 'option2', label: 'Important only', description: 'Only receive important notifications' },
                  { value: 'option3', label: 'None', description: 'Do not receive any notifications' },
                ]}
              />
            </div>
            
            <div className="mt-4">
              <Switch 
                label="Dark mode" 
                description="Enable dark mode for the application" 
                checked={switchValue}
                onChange={() => setSwitchValue(!switchValue)}
              />
              <div className="mt-2">
                <Switch 
                  label="Notifications" 
                  size="sm"
                  defaultChecked
                />
              </div>
              <div className="mt-2">
                <Switch 
                  label="Auto-save" 
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section>
        <h2 className="text-xl font-semibold mb-3">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge removable onRemove={() => alert('Badge removed')}>
            Removable
          </Badge>
        </div>
      </section>

      <Divider />

      <section>
        <h2 className="text-xl font-semibold mb-3">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the main content of the card.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card hoverable>
            <CardHeader>
              <CardTitle>Hoverable Card</CardTitle>
              <CardDescription>This card has a hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hover over this card to see the effect.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Divider />

      <section>
        <h2 className="text-xl font-semibold mb-3">Avatar</h2>
        <div className="flex flex-wrap gap-4">
          <Avatar
            src="https://i.pravatar.cc/150?img=1"
            alt="John Doe"
            size="sm"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=2"
            alt="Jane Smith"
            size="md"
            status="online"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=3"
            alt="Bob Johnson"
            size="lg"
            status="busy"
          />
          <Avatar
            src="https://i.pravatar.cc/150?img=4"
            alt="Alice Brown"
            size="xl"
            status="away"
          />
          <Avatar fallback="JD" size="md" />
          <Avatar alt="No Image" size="md" />
        </div>
      </section>

      <Divider label="Loading States" />

      <section>
        <h2 className="text-xl font-semibold mb-3">Loading & Skeleton</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Loading size="sm" />
            <Loading size="md" />
            <Loading size="lg" text="Loading..." />
          </div>

          <Button onClick={handleLoadingDemo}>
            {isLoading ? 'Loading...' : 'Show Loading for 2s'}
          </Button>

          {isLoading && <Loading fullScreen text="Please wait..." />}

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Skeleton Loading</h3>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section>
        <h2 className="text-xl font-semibold mb-3">Tooltip & Modal</h2>
        <div className="flex flex-wrap gap-4">
          <Tooltip content="This is a tooltip">
            <Button variant="outline">Hover me</Button>
          </Tooltip>

          <Tooltip
            content="Right aligned tooltip"
            side="right"
            align="center"
          >
            <Button variant="outline">Right tooltip</Button>
          </Tooltip>

          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Modal Title"
          >
            <div className="space-y-4">
              <p>This is a modal dialog with some content.</p>
              <p>You can close it by clicking the X button or outside the modal.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
              </div>
            </div>
          </Modal>
        </div>
      </section>
    </div>
  );
};

export default UIComponentsDemo;