CREATE TRIGGER on_rewrite_created
  AFTER INSERT ON public.rewrites
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_total_rewrites();