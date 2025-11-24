-- Allow clients to update their own orders (e.g. to mark as completed)
create policy "Clients can update their own orders"
  on orders for update
  using ( auth.uid() = client_id );
