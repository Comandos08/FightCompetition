/** Lê uma imagem escolhida pela pessoa e devolve uma versão reduzida, pronta para guardar. */
export function lerImagem(arquivo: File, ladoMaximo: number): Promise<string> {
  return new Promise((resolver, rejeitar) => {
    if (!arquivo.type.startsWith("image/")) return rejeitar(new Error("O arquivo não é uma imagem."));
    const leitor = new FileReader();
    leitor.onerror = () => rejeitar(new Error("Não foi possível ler o arquivo."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => rejeitar(new Error("Imagem inválida."));
      img.onload = () => {
        const escala = Math.min(1, ladoMaximo / Math.max(img.width, img.height));
        const tela = document.createElement("canvas");
        tela.width = Math.round(img.width * escala); tela.height = Math.round(img.height * escala);
        tela.getContext("2d")!.drawImage(img, 0, 0, tela.width, tela.height);
        resolver(tela.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  });
}
