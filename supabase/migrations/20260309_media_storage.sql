-- Criando bucket único para todo tipo de arquivo de usuário
insert into storage.buckets (id, name, public)
values ('workly_media', 'workly_media', false)
on conflict (id) do nothing;

-- Ativar RLS
create policy "Users can upload their own media"
on storage.objects for insert
with check (
  bucket_id = 'workly_media' and 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

create policy "Users can view their own media"
on storage.objects for select
using (
  bucket_id = 'workly_media' and 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

create policy "Users can update their own media"
on storage.objects for update
using (
  bucket_id = 'workly_media' and 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

create policy "Users can delete their own media"
on storage.objects for delete
using (
  bucket_id = 'workly_media' and 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
