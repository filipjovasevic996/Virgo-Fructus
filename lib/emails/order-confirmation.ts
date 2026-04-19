interface OrderItem {
  name: string
  weight: string
  quantity: number
  price: number
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  city: string
  address: string
  note?: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: string
}

function itemsTableRows(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e8e0d0; font-family: sans-serif; font-size: 14px; color: #1a1a1a;">
          ${item.name}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e8e0d0; font-family: sans-serif; font-size: 14px; color: #666; text-align: center;">
          ${item.weight}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e8e0d0; font-family: sans-serif; font-size: 14px; color: #666; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e8e0d0; font-family: sans-serif; font-size: 14px; color: #1a1a1a; text-align: right; font-weight: 600;">
          ${(item.price * item.quantity).toLocaleString('sr-RS')} RSD
        </td>
      </tr>`
    )
    .join('')
}

export function customerOrderEmail(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="sr">
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #f5f0e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f0e8; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #2c2c2c; padding: 32px 40px; text-align: center;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; color: #f5f0e8; letter-spacing: 1px;">
              Vigor Fructus
            </h1>
          </td>
        </tr>

        <!-- Confirmation -->
        <tr>
          <td style="padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 60px; height: 60px; border-radius: 50%; background-color: #c1d62e; line-height: 60px; text-align: center; font-size: 28px;">
                ✓
              </div>
            </div>
            
            <h2 style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 22px; color: #1a1a1a; text-align: center;">
              Hvala na porudžbini!
            </h2>
            <p style="margin: 0 0 24px; font-family: sans-serif; font-size: 14px; color: #666; text-align: center;">
              Porudžbina <strong>#${data.orderNumber}</strong> je uspešno primljena.
            </p>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e8e0d0; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
              <tr style="background-color: #f9f6f0;">
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: left;">Proizvod</th>
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: center;">Gram.</th>
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: center;">Kol.</th>
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: right;">Cena</th>
              </tr>
              ${itemsTableRows(data.items)}
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
              <tr>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #666;">Međuzbir</td>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #1a1a1a; text-align: right;">
                  ${data.subtotal.toLocaleString('sr-RS')} RSD
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #666;">Dostava</td>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #1a1a1a; text-align: right;">
                  ${data.deliveryFee === 0 ? 'Besplatna' : `${data.deliveryFee.toLocaleString('sr-RS')} RSD`}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 12px; border-top: 2px solid #e8e0d0;"></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #1a1a1a;">Ukupno</td>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 20px; font-weight: bold; color: #c1d62e; text-align: right;">
                  ${data.total.toLocaleString('sr-RS')} RSD
                </td>
              </tr>
            </table>

            <!-- Delivery Details -->
            <div style="background-color: #f9f6f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 16px; color: #1a1a1a;">
                Podaci za dostavu
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #999; width: 100px;">Ime</td>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #1a1a1a;">${data.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #999;">Telefon</td>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #1a1a1a;">${data.customerPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #999;">Email</td>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #1a1a1a;">${data.customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #999;">Adresa</td>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #1a1a1a;">${data.address}, ${data.city}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #999;">Plaćanje</td>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #1a1a1a;">${data.paymentMethod === 'cash' ? 'Pouzećem' : 'Karticom'}</td>
                </tr>
                ${data.note ? `
                <tr>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #999;">Napomena</td>
                  <td style="padding: 4px 0; font-family: sans-serif; font-size: 13px; color: #1a1a1a;">${data.note}</td>
                </tr>` : ''}
              </table>
            </div>

            <p style="margin: 0; font-family: sans-serif; font-size: 13px; color: #999; text-align: center;">
              Kontaktirajte nas na vigorfructus@gmail.com za sva pitanja.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #2c2c2c; padding: 20px 40px; text-align: center;">
            <p style="margin: 0; font-family: sans-serif; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} Vigor Fructus. Sva prava zadržana.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function supplierOrderEmail(data: OrderEmailData): string {
  return `
<!DOCTYPE html>
<html lang="sr">
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #f0f0f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f0f0; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #c1d62e; padding: 24px 40px;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 20px; color: #1a1a1a;">
              Nova porudžbina #${data.orderNumber}
            </h1>
          </td>
        </tr>

        <tr>
          <td style="padding: 32px 40px;">

            <!-- Customer Info -->
            <h3 style="margin: 0 0 12px; font-family: sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999;">
              Kupac
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f9f9f9; border-radius: 6px; padding: 16px;">
              <tr>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 13px; color: #999; width: 100px;">Ime</td>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 14px; color: #1a1a1a; font-weight: 600;">${data.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 13px; color: #999;">Telefon</td>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 14px; color: #1a1a1a;">
                  <a href="tel:${data.customerPhone}" style="color: #1a1a1a;">${data.customerPhone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 13px; color: #999;">Email</td>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 14px; color: #1a1a1a;">
                  <a href="mailto:${data.customerEmail}" style="color: #1a1a1a;">${data.customerEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 13px; color: #999;">Adresa</td>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 14px; color: #1a1a1a;">${data.address}, ${data.city}</td>
              </tr>
              <tr>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 13px; color: #999;">Plaćanje</td>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 14px; color: #1a1a1a;">${data.paymentMethod === 'cash' ? 'Pouzećem' : 'Karticom'}</td>
              </tr>
              ${data.note ? `
              <tr>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 13px; color: #999;">Napomena</td>
                <td style="padding: 4px 16px; font-family: sans-serif; font-size: 14px; color: #c0392b; font-weight: 600;">${data.note}</td>
              </tr>` : ''}
            </table>

            <!-- Items -->
            <h3 style="margin: 0 0 12px; font-family: sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999;">
              Stavke
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: left;">Proizvod</th>
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: center;">Gram.</th>
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: center;">Kol.</th>
                <th style="padding: 10px 16px; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: right;">Cena</th>
              </tr>
              ${itemsTableRows(data.items)}
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #666;">Međuzbir</td>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #1a1a1a; text-align: right;">${data.subtotal.toLocaleString('sr-RS')} RSD</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #666;">Dostava</td>
                <td style="padding: 6px 0; font-family: sans-serif; font-size: 14px; color: #1a1a1a; text-align: right;">${data.deliveryFee === 0 ? 'Besplatna' : `${data.deliveryFee.toLocaleString('sr-RS')} RSD`}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 12px; border-top: 2px solid #e0e0e0;"></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-family: sans-serif; font-size: 20px; font-weight: bold; color: #1a1a1a;">UKUPNO</td>
                <td style="padding: 8px 0; font-family: sans-serif; font-size: 22px; font-weight: bold; color: #27ae60; text-align: right;">${data.total.toLocaleString('sr-RS')} RSD</td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
