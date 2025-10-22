import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FormulaHelp({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guia de Fórmulas Disponíveis</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="math" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="math">Matemáticas</TabsTrigger>
            <TabsTrigger value="conditional">Condicionais</TabsTrigger>
            <TabsTrigger value="temporal">Temporais</TabsTrigger>
            <TabsTrigger value="basic">Básicas</TabsTrigger>
          </TabsList>

          <TabsContent value="math" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">SUM - Soma</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula a soma de múltiplos valores.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                SUM([1.1], [1.2], [1.3])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: SUM([1.1], [1.2]) = 150 se [1.1]=100 e [1.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">AVG - Média</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula a média aritmética de múltiplos valores.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                AVG([2.1], [2.2], [2.3])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: AVG([2.1], [2.2]) = 75 se [2.1]=100 e [2.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">MAX - Máximo</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o maior valor entre os argumentos.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                MAX([3.1], [3.2], 1000)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: MAX([3.1], [3.2]) = 100 se [3.1]=100 e [3.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">MIN - Mínimo</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o menor valor entre os argumentos.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                MIN([4.1], [4.2], 500)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: MIN([4.1], [4.2]) = 50 se [4.1]=100 e [4.2]=50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">ROUND - Arredondamento</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Arredonda um valor para o número de casas decimais especificado.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                ROUND([5.1] * 0.15, 2)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: ROUND(123.456, 2) = 123.46
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">ABS - Valor Absoluto</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o valor absoluto (sempre positivo).
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                ABS([6.1] - [6.2])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: ABS(-50) = 50
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">SQRT - Raiz Quadrada</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula a raiz quadrada de um valor.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                SQRT([7.1])
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: SQRT(144) = 12
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">POW - Potência</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Eleva um valor a uma potência.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                POW([8.1], 2)
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: POW(5, 2) = 25
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="conditional" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">IF - Condicional</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna um valor se a condição for verdadeira, outro se for falsa.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                IF([1.1] &gt; 1000, [2.1] * 1.1, [2.1])
              </code>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Operadores: &gt;, &lt;, &gt;=, &lt;=, ==, !=</p>
                <p>• Exemplo: IF([1.1] &gt; 100, 50, 25) = 50 se [1.1]=150</p>
                <p>• Exemplo: IF([2.1] == 0, 100, [2.1]) = 100 se [2.1]=0</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Combinando Condições</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Pode combinar múltiplas condições com operadores lógicos.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                IF([1.1] &gt; 100 &amp;&amp; [1.2] &lt; 50, [2.1], [2.2])
              </code>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• &amp;&amp; (E lógico): ambas condições devem ser verdadeiras</p>
                <p>• || (OU lógico): pelo menos uma condição deve ser verdadeira</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">PREV_MONTH - Mês Anterior</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o valor da conta no mês anterior.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                PREV_MONTH([1.1]) * 1.05
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: Crescimento de 5% em relação ao mês anterior
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">PREV_YEAR - Ano Anterior</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Retorna o valor da conta no mesmo mês do ano anterior.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                PREV_YEAR([2.1]) * 1.1
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: Crescimento de 10% em relação ao ano anterior
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">YTD - Acumulado do Ano</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Calcula o valor acumulado desde janeiro até o mês atual.
              </p>
              <code className="block bg-muted p-2 rounded text-sm">
                YTD([3.1]) / [4.1]
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Exemplo: Percentagem acumulada do ano sobre total
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Operadores Básicos</h3>
              <div className="space-y-3">
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [1.1] + [1.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Adição</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [2.1] - [2.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Subtração</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [3.1] * [3.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Multiplicação</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    [4.1] / [4.2]
                  </code>
                  <p className="text-xs text-muted-foreground">Divisão</p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-sm mb-1">
                    ([5.1] + [5.2]) * 0.15
                  </code>
                  <p className="text-xs text-muted-foreground">Use parênteses para controlar a ordem</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Referências a Contas</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Use colchetes para referenciar outras contas pelo código.
              </p>
              <code className="block bg-muted p-2 rounded text-sm mb-2">
                [1.1.2] + [1.1.3]
              </code>
              <p className="text-xs text-muted-foreground">
                As referências são substituídas pelos valores reais durante o cálculo.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Exemplos Complexos</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    IF([1.1] &gt; PREV_MONTH([1.1]), [1.1] * 1.1, [1.1])
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Aumenta 10% se cresceu em relação ao mês anterior
                  </p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    ROUND(AVG([2.1], [2.2], [2.3]) * 0.85, 2)
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Média de 3 contas com desconto de 15%, arredondada
                  </p>
                </div>
                <div>
                  <code className="block bg-muted p-2 rounded text-xs mb-1">
                    MAX(YTD([3.1]) / 12, PREV_YEAR([3.1]))
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Maior entre média mensal do ano e valor do ano anterior
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
