import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { insertPortSchema, type InsertPort, type Port, type Device } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  port?: Port;
  defaultDeviceId?: string;
}

export function PortDialog({ open, onOpenChange, port, defaultDeviceId }: PortDialogProps) {
  const { toast } = useToast();
  const isEditing = !!port;

  const { data: devices } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const form = useForm<InsertPort>({
    resolver: zodResolver(insertPortSchema),
    defaultValues: port ? {
      ...port,
      connectedTo: port.connectedTo || "",
      speed: port.speed || "",
      description: port.description || "",
    } : {
      deviceId: defaultDeviceId || "",
      portNumber: "",
      portType: "ethernet",
      status: "active",
      connectedTo: "",
      speed: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertPort) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/ports/${port.id}`, data);
      }
      return apiRequest("POST", "/api/ports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ports"] });
      toast({
        title: isEditing ? "Port updated" : "Port created",
        description: `Port ${form.getValues("portNumber")} has been ${isEditing ? "updated" : "added"} successfully.`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPort) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-port-dialog-title">
            {isEditing ? "Edit Port" : "Add New Port"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the port configuration below."
              : "Enter the details of the port you want to add."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-port-device">
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {devices?.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gi0/1" {...field} data-testid="input-port-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-port-type">
                          <SelectValue placeholder="Select port type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ethernet">Ethernet</SelectItem>
                        <SelectItem value="fiber">Fiber</SelectItem>
                        <SelectItem value="sfp">SFP</SelectItem>
                        <SelectItem value="usb">USB</SelectItem>
                        <SelectItem value="console">Console</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-port-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="connectedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connected To (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 205 PC" {...field} data-testid="input-port-connected-to" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speed (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 Gbps" {...field} data-testid="input-port-speed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this port..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="textarea-port-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-port"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-port">
                {mutation.isPending ? "Saving..." : isEditing ? "Update Port" : "Add Port"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
